
/**
 * OR with index signature
 *
 * export interface HttpbinRetCookie {
 *  cookies: {
 *    [prop: string]: string,
 *  }
 * }
 */
export interface HttpbinRetCookie {
  cookies: {
    [prop: string]: string,
  }
}


/** GET Response Interface of httpbin.org */
export interface HttpbinGetResponse <T = unknown> {
  args: T
  brotli?: boolean
  deflated?: boolean
  gzipped?: boolean
  headers: {
    Accept: string,
    Connection: string,
    Host: string,
    'User-Agent': string,
  }
  origin: string // ip
  url: string
}

/** POST Response Interface of httpbin.org */
export interface HttpbinPostResponse <T = unknown> extends HttpbinGetResponse <T> {
  data: string
  files?: {
    /** base64 */
    uploadFile?: string | undefined,
  } | undefined
  form: Record<keyof T, string>
  json: T
}

/** post data for test */
export interface PDATA {
  p1: string | number
  p2: string
  p3?: {
    foo: string,
  }
}

export type PostForm1 = Record<'p1' | 'p2', string>

