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
import { Headers, ResponseData, pickUrlStrFromRequestInfo } from '@waiting/fetch'

import type { Context } from '../interface'

import { ConfigKey } from './config'
import { FetchComponent } from './fetch.component'
import {
  Config,
  FetchOptions,
} from './types'


@Provide()
export class FetchService {

  @_Config(ConfigKey.config) protected readonly fetchConfig: Config
  @Inject() protected readonly ctx: Context
  @Inject() protected readonly fetchComponent: FetchComponent
  @Inject() protected readonly traceService: TraceService


  async fetch<T extends ResponseData>(
    options: FetchOptions,
  ): Promise<T> {

    const [ret] = await this.fetch2<T>(options)
    return ret
  }

  async fetch2<T extends ResponseData>(
    options: FetchOptions,
  ): Promise<[T, Headers]> {

    let opts = options

    if (this.fetchConfig.enableTrace) {
      opts = this.prepareTrace(options)
    }

    const ret = await this.fetchComponent.fetch2<T>(opts)
    return ret
  }


  get<T extends ResponseData>(
    input: string,
    options?: Omit<FetchOptions, 'url' | 'method'>,
  ): Promise<T> {

    const opts = {
      ...options,
      url: input,
      method: 'GET',
    } as FetchOptions
    return this.fetch(opts)
  }


  post<T extends ResponseData>(
    input: string,
    options?: Omit<FetchOptions, 'url' | 'method'>,
  ): Promise<T> {

    const opts = {
      ...options,
      url: input,
      method: 'POST',
    } as FetchOptions
    return this.fetch(opts)
  }


  protected prepareTrace(
    options: FetchOptions,
  ): FetchOptions {

    const opts = options

    if (! opts.span) {
      const txt = pickUrlStrFromRequestInfo(opts.url)
      const url = new URL(txt)
      const host = url.host.endsWith('/') ? url.host.slice(0, -1) : url.host
      const name = `HTTP ${opts.method.toLocaleUpperCase()} ${host}${url.pathname}`

      const traceContext: TraceContext = this.traceService.getActiveContext()
      const span: Span = this.traceService.startSpan(
        name,
        void 0,
        traceContext,
      )
      opts.traceContext = setSpan(traceContext, span)
      opts.span = span
    }

    return opts
  }

}

