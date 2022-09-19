/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  Config as _Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import {
  FetchResponse,
  fetch,
  Node_Headers,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'
import type { Span } from 'opentracing'

import type { Context } from '../interface'

import { ConfigKey, initialConfig } from './config'
import { defaultfetchConfigCallbacks } from './helper'
import { Config, Options } from './types'


@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class FetchComponent {

  @_Config(ConfigKey.config) readonly _config: Config

  @Inject() protected readonly ctx: Context

  fetchConfig: Config
  headers: Record<string, string> = {}
  readonly fetchRequestSpanMap = new Map<symbol, Span>()
  readonly responseHeadersMap = new Map<symbol, Headers>()

  @Init()
  async init(): Promise<void> {
    const config = {
      ...initialConfig,
      ...this._config,
    }
    this.fetchConfig = config
  }

  async fetch<T extends FetchResponse = any>(
    options: Options,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = { ...options }
    if (! opts.ctx && this.ctx) {
      opts.ctx = this.ctx
    }
    const id = Symbol(opts.url)
    opts.headers = await this.genReqHeadersFromOptionsAndConfigCallback(opts.ctx, opts.headers, opts.span)
    opts.beforeProcessResponseCallback = (input: Response) => this.cacheRespHeaders(id, input)

    const config = this.fetchConfig

    if (config.enableDefaultCallbacks) {
      await defaultfetchConfigCallbacks.beforeRequest({
        id,
        config,
        fetchRequestSpanMap: this.fetchRequestSpanMap,
        opts,
      })

      const currSpan = this.fetchRequestSpanMap.get(id)
      if (currSpan) {
        opts.headers = await this.genReqHeadersFromOptionsAndConfigCallback(opts.ctx, opts.headers, currSpan)
      }
    }

    if (config.beforeRequest) {
      await config.beforeRequest({
        id,
        fetchRequestSpanMap: this.fetchRequestSpanMap,
        config,
        opts,
      })
    }

    try {
      let ret = await fetch<T>(opts)

      const respHeaders = this.responseHeadersMap.get(id)

      if (config.processResult) {
        ret = config.processResult({
          id,
          config,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          resultData: ret,
          respHeaders,
        })
      }

      if (config.afterResponse) {
        await config.afterResponse({
          id,
          config,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          resultData: ret,
          respHeaders,
        })
      }

      if (config.enableDefaultCallbacks) {
        await defaultfetchConfigCallbacks.afterResponse({
          id,
          config,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          resultData: ret,
          respHeaders,
        })
      }

      this.responseHeadersMap.delete(id)
      return ret
    }
    catch (ex) {
      if (config.enableDefaultCallbacks) {
        if (typeof defaultfetchConfigCallbacks.processEx === 'function') {
          return defaultfetchConfigCallbacks.processEx({
            id,
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
          config: this.fetchConfig,
          fetchRequestSpanMap: this.fetchRequestSpanMap,
          opts,
          exception: ex as Error,
        })
      }
      this.responseHeadersMap.delete(id)
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
  async genReqHeadersFromOptionsAndConfigCallback(
    ctx: Context | undefined,
    initHeaders: Options['headers'],
    span?: Span,
  ): Promise<Headers> {

    const headers = new Node_Headers(initHeaders)
    if (typeof this.fetchConfig.genRequestHeaders !== 'function') {
      return headers
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx) {
      const ret = await this.fetchConfig.genRequestHeaders(ctx, headers, span)
      return ret
    }
    return headers
  }

  protected async cacheRespHeaders(id: symbol, input: Response): Promise<Response> {
    if (input?.headers) {
      this.responseHeadersMap.set(id, input.headers)
    }

    return input
  }
}

