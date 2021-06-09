/* eslint-disable node/no-unpublished-import */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { Config, Init, Inject, Provide } from '@midwayjs/decorator'
import type { Context } from '@midwayjs/web'
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

  @Inject() readonly ctx: Context

  @Config('fetch') readonly fetchConfig: FetchComponentConfig

  headers: Record<string, string> = {}

  @Init()
  async init(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.ctx.fetchRequestSpanMap) {
      return
    }
    this.ctx.fetchRequestSpanMap = new Map()
  }

  async fetch<T extends FetchResponse = any>(
    options: Options,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = { ...options }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    const isTraceLoggingReqBody = !! this.fetchConfig.enableTraceLoggingReqBody
    const isTraceLoggingRespData = !! this.fetchConfig.enableTraceLoggingRespData
    const id = Symbol(opts.url)

    if (this.fetchConfig.enableDefaultCallbacks) {
      await defaultfetchConfigCallbacks.beforeRequest({
        id,
        ctx: this.ctx,
        enableTraceLoggingReqBody: isTraceLoggingReqBody,
        opts,
      })

      const currSpan = this.ctx.fetchRequestSpanMap.get(id)
      if (currSpan) {
        opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers, currSpan)
      }
    }

    if (this.fetchConfig.beforeRequest) {
      await this.fetchConfig.beforeRequest({
        id,
        ctx: this.ctx,
        enableTraceLoggingReqBody: isTraceLoggingReqBody,
        opts,
      })
    }

    let ret = await fetch<T>(opts)

    if (this.fetchConfig.processResult) {
      ret = this.fetchConfig.processResult({
        id,
        ctx: this.ctx,
        enableTraceLoggingRespData: isTraceLoggingRespData,
        opts,
        resultData: ret,
      })
    }

    if (this.fetchConfig.afterResponse) {
      await this.fetchConfig.afterResponse({
        id,
        ctx: this.ctx,
        enableTraceLoggingRespData: isTraceLoggingRespData,
        opts,
        resultData: ret,
      })
    }

    if (this.fetchConfig.enableDefaultCallbacks) {
      await defaultfetchConfigCallbacks.afterResponse({
        id,
        ctx: this.ctx,
        enableTraceLoggingRespData: isTraceLoggingRespData,
        opts,
        resultData: ret,
      })
    }

    return ret
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
    const tmpHeader = this.fetchConfig.genRequestHeaders(this.ctx, this.headers, span)
    tmpHeader.forEach((value, key) => {
      // headers.append(key, value)
      headers.set(key, value)
    })
    return headers
  }

}

