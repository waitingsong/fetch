/* eslint-disable @typescript-eslint/ban-types */
import type { JsonType } from '@waiting/shared-types'
import type { Span } from 'opentracing'


export interface Options extends RequestInit, Args {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
  referrer?: 'client' | 'no-referrer'
}
/** Typeof original Response data */
export type FetchResponse = ArrayBuffer | Blob | FormData | Response | string | JsonType | void | never | object


export interface RespDataTypeList {
  arrayBuffer: ArrayBuffer
  /** Same as RespDataTypeList['raw'] but regardless of response status */
  bare: Response
  blob: Blob
  /** Not supported with fetch polyfill yet */
  formData: FormData
  json: JsonType
  text: string
  raw: Response
}
export type RespDataType = keyof RespDataTypeList


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
  data?: string | JsonType | Blob | FormData | object | URLSearchParams | null

  /**
   * Expect data type returned from server. jQuery behavior.
   * Return Response object without parse if set to "raw"
   *
   * @default 'json'
   */
  dataType?: RespDataType

  /** Pass a fetch() module for isomorphic usage such as node-fetch or isomorphic-fetch */
  fetchModule?: (input: string | Request, init?: RequestInit) => Promise<Response>
  headersInitClass?: typeof Headers

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
   * Tracer Span
   */
  span?: Span

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


