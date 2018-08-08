/** GET Response Interface of httpbin.org */
export interface HttpbinGetResponse {
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
