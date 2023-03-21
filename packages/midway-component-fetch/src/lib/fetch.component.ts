/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  Config as _Config,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core'
import { Context as TraceContext, Span, TraceService } from '@mwcp/otel'
import {
  Headers,
  Response,
  fetch,
  pickUrlStrFromRequestInfo,
  ResponseData,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'

import type { Context } from '../interface'

import { ConfigKey } from './config'
import { defaultfetchConfigCallbacks } from './helper'
import { Config, FetchOptions, ResponseHeadersMap } from './types'


@Provide()
@Scope(ScopeEnum.Singleton)
export class FetchComponent {

  @_Config(ConfigKey.config) protected readonly fetchConfig: Config
  // headers: Record<string, string> = {}

  async fetch<T extends ResponseData = any>(
    options: FetchOptions,
    ctx: Context,
    responseHeadersMap: ResponseHeadersMap,
    traceService: TraceService | undefined,
    traceContext: TraceContext | undefined,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: FetchOptions = { ...options }

    const url = pickUrlStrFromRequestInfo(opts.url)
    const id = Symbol(url)
    opts.headers = await this.genReqHeadersFromOptionsAndConfigCallback(ctx, opts.headers, opts.span, traceContext)
    opts.beforeProcessResponseCallback = (input: Response) => this.cacheRespHeaders(id, input, responseHeadersMap)

    const config = this.fetchConfig

    if (config.enableTrace) {
      await defaultfetchConfigCallbacks.beforeRequest({
        id,
        config,
        opts,
        ctx,
        traceService,
      })

      if (opts.span) {
        opts.headers = await this.genReqHeadersFromOptionsAndConfigCallback(
          ctx,
          opts.headers,
          opts.span,
          traceContext,
        )
      }
    }

    if (config.beforeRequest) {
      await config.beforeRequest({
        id,
        config,
        opts,
        ctx,
        traceService,
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
          ctx,
          traceService,
          traceContext,
        })
      }

      if (config.afterResponse) {
        await config.afterResponse({
          id,
          config,
          opts,
          resultData: ret,
          respHeaders,
          ctx,
          traceService,
          traceContext,
        })
      }

      if (config.enableTrace) {
        await defaultfetchConfigCallbacks.afterResponse({
          id,
          config,
          opts,
          resultData: ret,
          respHeaders,
          ctx,
          traceService,
          traceContext,
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
            ctx,
            traceService,
          })
        }
      }
      else if (typeof config.processEx === 'function') {
        return config.processEx({
          id,
          config: this.fetchConfig,
          opts,
          exception: ex as Error,
          ctx,
          traceService,
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
  async genReqHeadersFromOptionsAndConfigCallback(
    ctx: Context | undefined,
    initHeaders: FetchOptions['headers'],
    span?: Span,
    traceContext?: TraceContext,
  ): Promise<Headers> {

    const headers = new Headers(initHeaders)
    if (typeof this.fetchConfig.genRequestHeaders !== 'function') {
      return headers
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ctx) {
      const traceSvc = await ctx.requestContext.getAsync(TraceService)
      const ret = await this.fetchConfig.genRequestHeaders(
        ctx,
        headers,
        span,
        traceSvc,
        traceContext,
      )
      return ret
    }
    return headers
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

