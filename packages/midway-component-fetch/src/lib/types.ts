/* eslint-disable node/no-unpublished-import */
import { Options } from '@waiting/fetch'
import type { Span } from 'opentracing'

import { Context } from '../interface'


export interface FetchComponentConfig {
  /**
   * Generate headersInit from request context for Fetch request
   *
   * @default customGenReqHeadersInit()
   */
  genRequestHeaders: (
    ctx: Context,
    headersInit?: Record<string, string> | Headers,
    span?: Span,
  ) => Headers
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
  processEx?: (options: ProcessExCallbackOptions) => never
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

export interface ReqCallbackOptions {
  id: symbol
  ctx: Context
  config: FetchComponentConfig
  fetchRequestSpanMap: Map<symbol, Span>
  opts: Options
}

export interface RespCallbackOptions <T = unknown> {
  id: symbol
  ctx: Context
  config: FetchComponentConfig
  fetchRequestSpanMap: Map<symbol, Span>
  opts: Options
  resultData: T
}

export interface ProcessExCallbackOptions {
  id: symbol
  ctx: Context
  config: FetchComponentConfig
  fetchRequestSpanMap: Map<symbol, Span>
  opts: Options
  exception: Error
}

