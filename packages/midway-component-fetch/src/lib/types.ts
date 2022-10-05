import type { Context as TraceContext, Span, TraceService } from '@mwcp/otel'
import type { Options } from '@waiting/fetch'
import { MiddlewareConfig as MWConfig } from '@waiting/shared-types'

import { Context } from '../interface'


export type FetchOptions = Options
// export type FetchOptions = Options & {
//   /**
//    * Current OpenTelemetry Trace Context
//    */
//   traceContext?: TraceContext | undefined,
// }

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
    traceService?: TraceService,
    traceContext?: TraceContext | undefined,
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
   * Enable OpenTeleMetry trace
   * @default false
   * @description callbacks
   *   - beforeRequest() in helper.ts
   *   - afterResponse() in helper.ts
   *   - processEx() in helper.ts
   */
  enableTrace: boolean
  /**
   * @default true
   */
  traceEvent: boolean
  /**
   * @default true
   */
  traceRequestBody?: boolean
  /**
   * @default true
   */
  traceResponseData?: boolean
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
  captureRequestHeaders: string[]
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
  captureResponseHeaders: string[]
}
export type FetchComponentConfig = Config

export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>


export interface ReqCallbackOptions {
  id: symbol
  config: Config
  opts: FetchOptions
  ctx: Context
  traceService: TraceService | undefined
}

export interface RespCallbackOptions <T = unknown> {
  id: symbol
  config: Config
  opts: FetchOptions
  resultData: T
  respHeaders: Headers | undefined
  ctx: Context
  traceService: TraceService | undefined
  traceContext: TraceContext | undefined
}

export interface ProcessExCallbackOptions {
  id: symbol
  config: Config
  opts: FetchOptions
  exception: Error
  ctx: Context
  traceService: TraceService | undefined
}


export type ResponseHeadersMap = Map<symbol, Headers>

