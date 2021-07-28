/* eslint-disable node/no-unpublished-import */
import type { IMidwayWebContext as Context } from '@midwayjs/web'
import { Options } from '@waiting/fetch'
import type { Span } from 'opentracing'


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
   */
  traceLoggingReqHeaders?: string[]
  /**
   * @example ['authorization', 'user-agent', 'server']
   */
  traceLoggingRespHeaders?: string[]
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

