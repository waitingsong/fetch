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
    headersInit?: Record<string, string>,
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
   * Enable default tracing callbacks
   * @default false
   */
  enableDefaultCallbacks: boolean
  enableTraceLoggingReqBody?: boolean
  enableTraceLoggingRespData?: boolean
  /**
   * @example ['authorization', 'user-agent']
   */
  traceLoggingReqHeaders?: string[]
}

export interface ReqCallbackOptions {
  id: symbol
  ctx: Context
  enableTraceLoggingReqBody: boolean
  traceLoggingReqHeaders: string[]
  opts: Options
}

export interface RespCallbackOptions <T = unknown> {
  id: symbol
  ctx: Context
  enableTraceLoggingRespData: boolean
  opts: Options
  resultData: T
}

