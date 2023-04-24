import type {
  AbstractTraceService,
  Context as TraceContext,
} from '@mwcp/otel'
import type { Headers, Options } from '@waiting/fetch'
import { MiddlewareConfig as MWConfig } from '@waiting/shared-types'

import { Context } from '../interface'


// export type FetchOptions = Options
export type FetchOptions = Options & TraceOptions

export interface Config {
  /**
   * Generate headersInit from request context for Fetch request
   *
   * @default customGenReqHeadersInit()
   */
  genRequestHeaders: (
    options: FetchOptions,
    headersInit: Record<string, string> | Headers,
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
}

export interface RespCallbackOptions <T = unknown> {
  id: symbol
  config: Config
  opts: FetchOptions
  resultData: T
  respHeaders: Headers | undefined
}

export interface ProcessExCallbackOptions {
  id: symbol
  config: Config
  opts: FetchOptions
  exception: Error
}


export type ResponseHeadersMap = Map<symbol, Headers>


export interface TraceOptions {
  webContext?: Context | undefined
  traceService?: AbstractTraceService | undefined
  traceContext?: TraceContext | undefined
}

