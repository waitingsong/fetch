import { JsonType } from '../src/index'

/**
 * OR with index signature
 *
 * export interface HttpbinRetCookie {
 *  cookies: {
 *    [prop: string]: string,
 *  }
 *  [key: string]: any  // <------- index signature
 * }
 */
export interface HttpbinRetCookie extends JsonType {
  cookies: {
    [prop: string]: string,
  }
}


/** GET Response Interface of httpbin.org */
export interface HttpbinGetResponse extends JsonType {
  args: any
  headers: {
    Accept: string
    Connection: string
    Host: string
    'User-Agent': string,
  }
  origin: string  // ip
  url: string
}

/** POST Response Interface of httpbin.org */
export interface HttpbinPostResponse extends HttpbinGetResponse {
  data: string
  files: any
  form: any
  json: any
}

/** post data for test */
export interface PDATA {
  p1: string | number
  p2: string
  p3?: {
    foo: string,
  }
}
