/* eslint-disable node/no-unpublished-import */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import {
  Config,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { Context } from '@midwayjs/web'
import {
  FetchResponse,
  Options,
  fetch,
  Node_Headers,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'
import type { Span } from 'opentracing'

import { defaultfetchConfigCallbacks } from './helper'
import { FetchComponentConfig } from './types'


@Provide()
export class FetchComponent {

  @Inject() protected ctx: Context

  @Config('fetch') readonly fetchConfig: FetchComponentConfig

  headers: Record<string, string> = {}
  readonly fetchRequestSpanMap = new Map<symbol, Span>()

  // @Init()
  // async init(): Promise<void> {
  //   // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  //   if (this.ctx.fetchRequestSpanMap) {
  //     return
  //   }
  //   this.ctx.fetchRequestSpanMap = new Map()
  // }

  async fetch<T extends FetchResponse = any>(
    options: Options,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = { ...options }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    const config = this.fetchConfig
    const id = Symbol(opts.url)

    if (this.fetchConfig.enableDefaultCallbacks) {
      await defaultfetchConfigCallbacks.beforeRequest({
        id,
        ctx: this.ctx,
        config: this.fetchConfig,
        fetchRequestSpanMap: this.fetchRequestSpanMap,
        opts,
      })

      const currSpan = this.fetchRequestSpanMap.get(id)
      if (currSpan) {
        opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers, currSpan)
      }
    }

    if (config.beforeRequest) {
      await config.beforeRequest({
        id,
        ctx: this.ctx,
        fetchRequestSpanMap: this.fetchRequestSpanMap,
        config: this.fetchConfig,
        opts,
      })
    }

    try {
      let ret = await fetch<T>(opts)

      if (config.processResult) {
        ret = config.processResult({
          id,
          ctx: this.ctx,
          config: this.fetchConfig,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          resultData: ret,
        })
      }

      if (config.afterResponse) {
        await config.afterResponse({
          id,
          ctx: this.ctx,
          config: this.fetchConfig,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          resultData: ret,
        })
      }

      if (config.enableDefaultCallbacks) {
        await defaultfetchConfigCallbacks.afterResponse({
          id,
          ctx: this.ctx,
          config: this.fetchConfig,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          resultData: ret,
        })
      }

      return ret
    }
    catch (ex) {
      if (config.enableDefaultCallbacks) {
        if (typeof defaultfetchConfigCallbacks.processEx === 'function') {
          return defaultfetchConfigCallbacks.processEx({
            id,
            ctx: this.ctx,
            config: this.fetchConfig,
            fetchRequestSpanMap: this.fetchRequestSpanMap,
            opts,
            exception: ex as Error,
          })
        }
      }
      else if (typeof config.processEx === 'function') {
        return config.processEx({
          id,
          ctx: this.ctx,
          config: this.fetchConfig,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          exception: ex as Error,
        })
      }
      throw ex
    }
  }


  get<T extends FetchResponse = any>(
    input: string,
    options?: Omit<Options, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = {
      ...options,
      url: input,
      method: 'GET',
    }
    return this.fetch(opts)
  }


  post<T extends FetchResponse = any>(
    input: string,
    options?: Omit<Options, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = {
      ...options,
      url: input,
      method: 'POST',
    }
    return this.fetch(opts)
  }


  /**
   * Duplicate key will be overwritten,
   * by headers.set() instead of headers.append()
   */
  genReqHeadersFromOptionsAndConfigCallback(
    initHeaders: Options['headers'],
    span?: Span,
  ): Headers {

    const headers = new Node_Headers(initHeaders)
    if (typeof this.fetchConfig.genRequestHeaders !== 'function') {
      return headers
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.ctx) {
      const ret = this.fetchConfig.genRequestHeaders(this.ctx, headers, span)
      return ret
    }
    return headers
  }

}

