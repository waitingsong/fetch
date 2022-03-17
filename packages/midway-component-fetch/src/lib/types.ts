import { Options as FetchOptions } from '@waiting/fetch'
import { MiddlewareConfig as MWConfig } from '@waiting/shared-types'
import type { Span } from 'opentracing'

import { Context } from '../interface'


export type Options = FetchOptions & {
  ctx?: Context | undefined,
}

export interface Config {
  /**
   * Generate headersInit from request context for Fetch request
   *
   * @default customGenReqHeadersInit()
   */
  genRequestHeaders: (
    ctx: Context,
    headersInit?: Record<string, string> | Headers,
    span?: Span,
  ) => Promise<Headers>
  /**
   * Callback before request
   */
  beforeRequest?: (options: ReqCallbackOptions) => Promise<void>
  /**
   * fetch result processed
   */
  processResult?: <T = unknown>(options: RespCallbackOptions<T>) => T
  /**
   * Callback after response
   */
  afterResponse?: <T = unknown>(options: RespCallbackOptions<T>) => Promise<void>
  /**
   * Callback handling exception
   * @description process caught Exception then throw it
   */
  processEx?: (options: ProcessExCallbackOptions) => Promise<never>
  /**
   * Enable default tracing callbacks
   * @default false
   * @description callbacks
   *   - beforeRequest() in helper.ts
   *   - afterResponse() in helper.ts
   *   - processEx() in helper.ts
   */
  enableDefaultCallbacks: boolean
  enableTraceLoggingReqBody?: boolean
  enableTraceLoggingRespData?: boolean
  /**
   * @example ['authorization', 'user-agent']
   * @default
   *   - 'Accept'
   *   - 'authorization'
   *   - 'Content-Length'
   *   - 'Date'
   *   - 'Host'
   *   - 'user-agent'
   *   - HeadersKey.reqId
   */
  traceLoggingReqHeaders: string[]
  /**
   * @example ['authorization', 'user-agent', 'server']
   * @default
   *   - 'Age'
   *   - 'Cache-Control'
   *   - 'Content-Encoding'
   *   - 'Content-Length'
   *   - 'content-type'
   *   - 'Date'
   *   - 'Location'
   *   - 'server'
   *   - 'x-aspnet-version'
   *   - 'x-powered-by'
   */
  traceLoggingRespHeaders: string[]
}
export type FetchComponentConfig = Config

export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>



export interface ReqCallbackOptions {
  id: symbol
  config: Config
  fetchRequestSpanMap: Map<symbol, Span>
  opts: Options
}

export interface RespCallbackOptions <T = unknown> {
  id: symbol
  config: Config
  fetchRequestSpanMap: Map<symbol, Span>
  opts: Options
  resultData: T
}

export interface ProcessExCallbackOptions {
  id: symbol
  config: Config
  fetchRequestSpanMap: Map<symbol, Span>
  opts: Options
  exception: Error
}

