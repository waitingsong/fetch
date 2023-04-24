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
  Response,
  fetch,
  pickUrlStrFromRequestInfo,
  ResponseData,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'

import { ConfigKey } from './config'
import { defaultfetchConfigCallbacks } from './helper'
import { Config, FetchOptions, ResponseHeadersMap } from './types'


@Autoload()
@Singleton()
export class FetchComponent {

  @_Config(ConfigKey.config) protected readonly fetchConfig: Config

  @Inject() readonly otel: OtelComponent

  async fetch<T extends ResponseData = any>(
    options: FetchOptions,
    responseHeadersMap: ResponseHeadersMap,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: FetchOptions = { ...options }

    const url = pickUrlStrFromRequestInfo(opts.url)
    const id = Symbol(url)
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(
      opts,
      opts.headers,
    )
    opts.beforeProcessResponseCallback = (input: Response) => this.cacheRespHeaders(id, input, responseHeadersMap)

    const config = this.fetchConfig

    if (config.enableTrace) {
      await defaultfetchConfigCallbacks.beforeRequest({
        id,
        config,
        opts,
      })

      if (opts.span) {
        opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(
          opts,
          opts.headers,
        )
      }
    }

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
      }
      let ret = await fetch<T>(opts2)

      const respHeaders = responseHeadersMap.get(id)

      if (config.processResult) {
        ret = config.processResult({
          id,
          config,
          opts,
          resultData: ret,
          respHeaders,
        })
      }

      if (config.afterResponse) {
        await config.afterResponse({
          id,
          config,
          opts,
          resultData: ret,
          respHeaders,
        })
      }

      if (config.enableTrace) {
        await defaultfetchConfigCallbacks.afterResponse({
          id,
          config,
          opts,
          resultData: ret,
          respHeaders,
        })
      }

      responseHeadersMap.delete(id)
      return ret
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
      responseHeadersMap.delete(id)
      throw ex
    }
  }

  /**
   * Duplicate key will be overwritten,
   * by headers.set() instead of headers.append()
   */
  genReqHeadersFromOptionsAndConfigCallback(
    options: FetchOptions,
    initHeaders: FetchOptions['headers'],
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

  protected async cacheRespHeaders(
    id: symbol,
    input: Response,
    responseHeadersMap: ResponseHeadersMap,
  ): Promise<Response> {

    if (input?.headers) {
      responseHeadersMap.set(id, input.headers)
    }
    return input
  }

}

