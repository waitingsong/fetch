# rxxfetch

Observable HTTP Fetch() wrapped by rxjs6, support browser and Node.js

[![Version](https://img.shields.io/npm/v/rxxfetch.svg)](https://www.npmjs.com/package/rxxfetch)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/waitingsong/rxxfetch.svg?branch=master)](https://travis-ci.org/waitingsong/rxxfetch)
[![Build status](https://ci.appveyor.com/api/projects/status/gsxo6hg06av6gw02/branch/master?svg=true)](https://ci.appveyor.com/project/waitingsong/rxxfetch/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/waitingsong/rxxfetch/badge.svg?branch=master)](https://coveralls.io/github/waitingsong/rxxfetch?branch=master)



## Installing

```bash
npm install rxxfetch
```

## Usage

- Get json result

  ```ts
  import { get, RxRequestInit } from 'rxxfetch'

  const url = 'https://httpbin.org/get'

  get<HttpbinGetResponse>(url, args).subscribe(
    json => {
      console.log(json.url)
    },
    console.error,
  )

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
  ```

- Get txt result

  ```ts
  import { get, RxRequestInit } from 'rxxfetch'

  const url = 'https://httpbin.org/get'
  const args: RxRequestInit = {
    dataType: 'text'
  }

  get<string>(url, args).subscribe(
    txt => {
      console.log(txt)
    },
    console.error,
  )

  ```

- Post data

  ```ts
  import { post, RxRequestInit } from 'rxxfetch'

  const url = 'https://httpbin.org/post'
  const pdata = {
    p1: Math.random(),
    p2: Math.random().toString(),
  }
  const args: RxRequestInit = {
    data: pdata
  }

  post<HttpbinPostResponse>(url, args).subscribe(
    res => {
      const form = res.form
      assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
      assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
    },
  )

  /** POST Response Interface of httpbin.org */
  export interface HttpbinPostResponse extends HttpbinGetResponse {
    data: string
    files: any
    form: any
    json: any
  }
  ```

- More demos includes `PUT` `REMOVE` see [TEST](https://github.com/waitingsong/rxxfetch/tree/master/test_browser)

- Node.js need some pollyfill, details in [TEST](https://github.com/waitingsong/rxxfetch/tree/master/test)

  ```ts
  import nodefetch, { Headers } from 'node-fetch'

  const args = <RxRequestInit> {
    fetchModule: nodefetch,
    headersInitClass: Headers,
  }
  ```

- Handle cookies when 302/303/307 redirect on Node.js, [CODE](https://github.com/waitingsong/rxxfetch/blob/master/test/30_cookie.test.ts)

  ```ts
  import nodefetch, { Headers } from 'node-fetch'

  const args = <RxRequestInit> {
    fetchModule: nodefetch,
    headersInitClass: Headers,
    keepRedirectCookies: true,  // <---- intercept redirect
  }
  ```

- Cancel an request via `AbortController`, details in [CODE](https://github.com/waitingsong/rxxfetch/blob/master/test/30_request.test.ts#L20)

  ```ts
  import { abortableFetch, AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
  import nodefetch, { Headers } from 'node-fetch'

  const { fetch } = abortableFetch(nodefetch)
  const args = <RxRequestInit> {
    fetchModule: fetch,
    headersInitClass: Headers,
  }
  ```


## License

[MIT](LICENSE)


### Languages

- [English](README.md)
- [中文](README.zh-CN.md)
