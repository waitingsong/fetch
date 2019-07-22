/* eslint-disable @typescript-eslint/no-explicit-any */

/** Typeof original Response data */
export type ObbRetType = ArrayBuffer | Blob | FormData | Response | string | JsonType | void | never

/** Value of key-value pairs object */
export type PlainJsonValueType = boolean | number | string | null | undefined

/**
 * Typeof JSON object parsed from Response data
 * simple key-value pairs object.
 */
export interface JsonType {
  [key: string]: PlainJsonValueType | PlainJsonValueType[] | JsonType | JsonType[]
}

/** Same as jQuery v3 `JQuery.PlainObject` */
export interface PlainObject<T = any> {
  [key: string]: T
}

export type RespDataTypeName = keyof RespDataType
export interface RespDataType {
  arrayBuffer: ArrayBuffer
  /** Same as RespDataType['raw'] but regardless of response status */
  bare: Response
  blob: Blob
  /** Not supported with fetch polyfill yet */
  formData: FormData
  json: JsonType
  text: string
  raw: Response
}


/** See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type */
export type ContentType = string

/** RxRequestInit extends from */
export interface Args {
  /** Instance of AbortController to aborting Request */
  abortController?: AbortController

  /** Append custom cookies with key:value object */
  cookies?: { [key: string]: string | number | null } | null

  /** Content-Type, jQuery behavior, default "application/x-www-form-urlencoded; charset=UTF-8" during POST */
  contentType?: false | ContentType

  /** Send to server, resolve to query string during GET|DELETE and key/value pairs during POST */
  data?: JsonType | Blob | FormData | object | null

  /**
   * Expect data type returned from server. jQuery behavior.
   * Default "json"
   * Return Response object without parse if set to "raw"
   */
  dataType?: RespDataTypeName

  /** Pass a fetch() module for isomorphic usage such as node-fetch or isomorphic-fetch */
  fetchModule?: (input: string | Request, init?: RequestInit) => Promise<Response | any>
  headersInitClass?: typeof Headers | HeadersFixed | any

  /**
   * Under Node.js,
   * Whether intercept 301-308 redirect and then do jumping with the cookies retrieved from the Response headers.
   * Default is FALSE.
   * There's no effect under Browsers
   */
  keepRedirectCookies?: boolean

  /** whether process Args.data automatically. jQuery behavior */
  processData?: boolean

  /**
   * Request timeout in msec. default value Infinity.
   * Also for aborting reqeust via abortController
   */
  timeout?: number | null
}

export interface RxRequestInit extends RequestInit, Args {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
  referrer?: 'client' | 'no-referrer'
}

/** For karma test */
export interface HeadersFixed extends Headers {
  [prop: string]: any
}

/** Inner use */
export interface ArgsRequestInitCombined {
  args: Args
  requestInit: RequestInit
}

/** Custom response json data structure */
export interface AjaxResp<T extends JsonType = JsonType> extends JsonType {
  /** 0: no error */
  err: number
  dat?: T
  msg?: string | null
}
