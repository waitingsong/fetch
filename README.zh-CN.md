# rxxfetch

HTTP Fetch() 响应式实现，基于 rxjs6 封装，支持长青浏览器和 Node.js

[![Version](https://img.shields.io/npm/v/rxxfetch.svg)](https://www.npmjs.com/package/rxxfetch)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/waitingsong/rxxfetch.svg?branch=master)](https://travis-ci.org/waitingsong/rxxfetch)
[![Build status](https://ci.appveyor.com/api/projects/status/gsxo6hg06av6gw02/branch/master?svg=true)](https://ci.appveyor.com/project/waitingsong/rxxfetch/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/waitingsong/rxxfetch/badge.svg?branch=master)](https://coveralls.io/github/waitingsong/rxxfetch?branch=master)



## 安装

```bash
npm install rxxfetch
```

## 使用

- Get 获取 json 结果

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

- Get 获取 txt 结果

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

- Post 提交数据

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

- 包括 `PUT` `REMOVE` 请求类型的更多演示请见 [Test](https://github.com/waitingsong/rxxfetch/tree/master/test_browser)

- Node.js 先要一些扩展包，详情见 [Test](https://github.com/waitingsong/rxxfetch/tree/master/test)

  ```ts
  import nodefetch, { Headers } from 'node-fetch'

  const args = <RxRequestInit> {
    fetchModule: nodefetch,
    headersInitClass: Headers,
  }
  ```


## License

[MIT](LICENSE)


### Languages

- [English](README.md)
- [中文](README.zh-CN.md)
