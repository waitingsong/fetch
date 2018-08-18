export type ObbRetType = ArrayBuffer | Blob | FormData | Response | string | object

/** see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type */
export type ContentType = string

export interface Args {
  /** instance of AbortController to aborting Request */
  abortController?: AbortController

  /** append custom cookies with key:value object */
  cookies?: { [key: string]: string | number | null }

  /** Content-Type, jQuery behavior, default "application/x-www-form-urlencoded; charset=UTF-8" during POST */
  contentType?: false | ContentType

  /** send to server, resolve to query string during GET|DELETE and key/value pairs during POST */
  data?: object

  /**
   * expect data type returned from server. jQuery behavior.
   * default "json"
   * return Response object without parse if set to "raw"
   */
  dataType?: 'arrayBuffer' | 'blob' | 'formData' | 'json' | 'text' | 'raw'

  /** pass a fetch() module for isomorphic usage such as node-fetch or isomorphic-fetch */
  fetchModule?: (input: string | Request, init?: RequestInit) => Promise<Response | any>
  headersInitClass?: typeof Headers | HeadersFixed | any
  /** whether process Args.data automatically. jQuery behavior */
  processData?: boolean

  /** msec default Infinity */
  timeout?: number | null
}

export interface RxRequestInit extends RequestInit, Args {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'
  referrer?: 'client' | 'no-referrer'
}

/** for karma test */
export interface HeadersFixed extends Headers {
  [prop: string]: any
}

export interface ArgsRequestInitCombined {
  args: Args
  requestInit: RequestInit
}
