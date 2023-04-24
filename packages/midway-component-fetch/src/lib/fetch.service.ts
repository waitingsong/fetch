/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Config as _Config,
  Inject,
  Provide,
} from '@midwayjs/core'
import {
  Context as TraceContext,
  Span,
  TraceService,
  setSpan,
} from '@mwcp/otel'
import { ResponseData, Headers, pickUrlStrFromRequestInfo } from '@waiting/fetch'
import type { OverwriteAnyToUnknown } from '@waiting/shared-types'

import type { Context } from '../interface'

import { ConfigKey } from './config'
import { FetchComponent } from './fetch.component'
import {
  Config,
  FetchOptions,
  ResponseHeadersMap,
} from './types'


@Provide()
export class FetchService {

  @_Config(ConfigKey.config) protected readonly fetchConfig: Config
  @Inject() protected readonly ctx: Context
  @Inject() protected readonly fetchComponent: FetchComponent
  @Inject() protected readonly traceService: TraceService

  readonly responseHeadersMap: ResponseHeadersMap = new Map<symbol, Headers>()

  async fetch<T extends ResponseData = any>(
    options: FetchOptions,
  ): Promise<OverwriteAnyToUnknown<T>> {

    let opts = options
    let traceContext

    if (this.fetchConfig.enableTrace) {
      const traceCtx = this.traceService.getActiveContext()
      opts = this.prepareTrace(options, traceCtx)
      traceContext = setSpan(traceCtx, opts.span as Span)
    }

    return this.fetchComponent.fetch(
      opts,
      this.ctx,
      this.responseHeadersMap,
      this.traceService,
      traceContext,
    )
  }


  get<T extends ResponseData = any>(
    input: string,
    options?: Omit<FetchOptions, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts = {
      ...options,
      url: input,
      method: 'GET',
    } as FetchOptions
    return this.fetch(opts)
  }


  post<T extends ResponseData = any>(
    input: string,
    options?: Omit<FetchOptions, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts = {
      ...options,
      url: input,
      method: 'POST',
    } as FetchOptions
    return this.fetch(opts)
  }


  protected prepareTrace(
    options: FetchOptions,
    traceContext: TraceContext,
  ): FetchOptions {

    const opts = { ...options } as FetchOptions
    if (! opts.span) {

      const txt = pickUrlStrFromRequestInfo(opts.url)
      const url = new URL(txt)
      const host = url.host.endsWith('/') ? url.host.slice(0, -1) : url.host
      const name = `HTTP ${opts.method.toLocaleUpperCase()} ${host}${url.pathname}`

      opts.span = this.traceService.startSpan(
        name,
        void 0,
        traceContext,
      )
    }

    return opts
  }

}

