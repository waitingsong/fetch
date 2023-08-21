/* eslint-disable @typescript-eslint/ban-types */
import type { Span } from '@opentelemetry/api'
import type { JsonObject } from '@waiting/shared-types'
import {
  FormData,
  HeadersInit,
  Response,
  RequestInfo,
  RequestInit,
} from 'undici'


export {
  FormData,
  Headers,
  Response,
} from 'undici'
export type {
  HeadersInit,
  RequestInfo,
  RequestInit,
} from 'undici'


export interface Options extends RequestInit, Args {
  url: RequestInfo
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
  beforeProcessResponseCallback?: (res: Response) => Promise<Response>
  headers?: HeadersInit
}
/** Typeof resolved Response data */
export type ResponseData = ArrayBuffer | Blob | FormData |
string | JsonObject | void | never | object


export enum FnKeys {
  'arrayBuffer' = 'arrayBuffer',
  'blob' = 'blob',
  'formData' = 'formData',
  'json' = 'json',
  'text' = 'text',
}
export type ResponseProcessNameKeys = keyof Response & keyof typeof FnKeys
export type ResponseRawKeys = 'raw' | 'bare'



/** @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type */
export type ContentType = string | ContentTypeList
export enum ContentTypeList {
  formDataPartial = 'multipart/form-data; boundary=',
  formUrlencoded = 'application/x-www-form-urlencoded; charset=utf-8',
  html = 'text/html; charset=utf-8',
  json = 'application/json; charset=utf-8',
  plain = 'text/plain',
}

/** Options extends from */
export interface Args {
  /** Instance of AbortController to aborting Request */
  abortController?: AbortController

  /** Append custom cookies with key:value object */
  cookies?: { [key: string]: string | number | null } | null

  /**
   * Content-Type, jQuery behavior,
   *
   * @default "application/x-www-form-urlencoded; charset=UTF-8" during POST
   */
  contentType?: false | ContentType

  /**
   * Send to server, resolve to query string during GET | DELETE and key/value pairs during POST.
   * If not undefined then will override the value of `body`
   **/
  data?: string | JsonObject | Blob | FormData | object | URLSearchParams | null

  /**
   * Expect data type returned from server. jQuery behavior.
   * Return Response object without parse if set to "raw"
   *
   * @default 'json'
   */
  dataType?: ResponseProcessNameKeys | ResponseRawKeys

  /**
   * Under Node.js,
   * Whether intercept 301-308 redirect and then do jumping with the cookies retrieved
   * from the Response headers.
   *
   * @default false
   * @description There's no effect under Browsers
   */
  keepRedirectCookies?: boolean

  /**
   * Whether process Args.data automatically. jQuery behavior.
   *
   * @default true
   */
  processData?: boolean

  /**
   * Current OpenTelemetry Span
   */
  span?: Span | undefined

  /**
   * Request timeout in msec.
   * Also for aborting reqeust via abortController
   *
   * @default Infinity
   */
  timeout?: number
}

export type GetLikeMethod = 'GET' | 'DELETE'
export type PostLikeMethod = Exclude<NonNullable<Options['method']>, GetLikeMethod>


/** Inner use */
export interface ArgsRequestInitCombined {
  args: Args
  requestInit: RequestInit
}


export enum FetchMsg {
  httpErrorMsgPrefix = 'Fetch error status:'
}


export enum AttributeKey {
  PrepareRequestData = 'prepare-request-data',
  ProcessRequestData = 'process-request-data',
  HandleRedirectFinish = 'handle-redirect-finish',
  RequestStart = 'request-start',
  RequestFinish = 'request-finish',
  RequestTimeout = 'request-timeout',
  HandleResponseError = 'handle-response-error',
  ProcessResponseStart = 'process-response-start',
  ProcessResponseFinish = 'process-response-finish',
}
