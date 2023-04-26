/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  Autoload,
  Config as _Config,
  Singleton,
  Inject,
} from '@midwayjs/core'
import { OtelComponent } from '@mwcp/otel'
import {
  Headers,
  fetch2,
  pickUrlStrFromRequestInfo,
  ResponseData,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'

import { ConfigKey } from './config'
import { defaultfetchConfigCallbacks } from './helper'
import { Config, FetchOptions } from './types'


@Autoload()
@Singleton()
export class FetchComponent {

  @_Config(ConfigKey.config) protected readonly fetchConfig: Config

  @Inject() readonly otel: OtelComponent

  async fetch<T extends ResponseData = any>(
    options: FetchOptions,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: FetchOptions = { ...options }

    if (! opts.otelComponent) {
      opts.otelComponent = this.otel
    }

    const url = pickUrlStrFromRequestInfo(opts.url)
    const id = Symbol(url)
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(
      opts,
      opts.headers,
    )
    // opts.beforeProcessResponseCallback = (input: Response) => this.cacheRespHeaders(id, input, responseHeadersMap)

    const config = this.fetchConfig

    await defaultfetchConfigCallbacks.beforeRequest({
      id,
      config,
      opts,
    })

    if (config.beforeRequest) {
      await config.beforeRequest({
        id,
        config,
        opts,
      })
    }

    try {
      const opts2 = { ...opts }
      if (! this.fetchConfig.traceEvent) {
        delete opts2.span
        delete opts2.traceService
        delete opts2.traceContext
      }
      const data = await fetch2<T>(opts2)

      if (config.processResult) {
        data[0] = config.processResult({
          id,
          config,
          opts,
          resultData: data[0],
          respHeaders: data[1],
        })
      }

      if (config.afterResponse) {
        await config.afterResponse({
          id,
          config,
          opts,
          resultData: data[0],
          respHeaders: data[1],
        })
      }

      if (config.enableTrace) {
        await defaultfetchConfigCallbacks.afterResponse({
          id,
          config,
          opts,
          resultData: data[0],
          respHeaders: data[1],
        })
      }

      return data[0]
    }
    catch (ex) {
      if (config.enableTrace) {
        if (typeof defaultfetchConfigCallbacks.processEx === 'function') {
          return defaultfetchConfigCallbacks.processEx({
            id,
            config: this.fetchConfig,
            opts,
            exception: ex as Error,
          })
        }
      }
      else if (typeof config.processEx === 'function') {
        return config.processEx({
          id,
          config: this.fetchConfig,
          opts,
          exception: ex as Error,
        })
      }
      throw ex
    }
  }

  /**
   * Duplicate key will be overwritten,
   * by headers.set() instead of headers.append()
   */
  genReqHeadersFromOptionsAndConfigCallback(
    options: FetchOptions,
    initHeaders: FetchOptions['headers'] | undefined,
  ): Headers {

    const headers = new Headers(initHeaders)
    if (typeof this.fetchConfig.genRequestHeaders !== 'function') {
      return headers
    }

    const ret = this.fetchConfig.genRequestHeaders(
      options,
      headers,
    )
    return ret
  }

}

