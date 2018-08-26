export type ObbRetType = ArrayBuffer | Blob | FormData | Response | string | object

export interface RespDataType {
  arrayBuffer: ArrayBuffer
  /** same to raw but regardless of response status */
  bare: Response
  blob: Blob
  /** Not supported with fetch polyfill yet */
  formData: FormData
  json: object
  text: string
  raw: Response
}

/** See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type */
export type ContentType = string

export interface Args {
  /** Instance of AbortController to aborting Request */
  abortController?: AbortController

  /** Append custom cookies with key:value object */
  cookies?: { [key: string]: string | number | null }

  /** Content-Type, jQuery behavior, default "application/x-www-form-urlencoded; charset=UTF-8" during POST */
  contentType?: false | ContentType

  /** Send to server, resolve to query string during GET|DELETE and key/value pairs during POST */
  data?: object

  /**
   * Expect data type returned from server. jQuery behavior.
   * Default "json"
   * Return Response object without parse if set to "raw"
   */
  dataType?: keyof RespDataType

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

  /** msec Default value Infinity */
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

export interface ArgsRequestInitCombined {
  args: Args
  requestInit: RequestInit
}
