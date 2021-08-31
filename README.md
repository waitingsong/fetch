# NodeJS Fetch

[![GitHub tag](https://img.shields.io/github/tag/waitingsong/fetch.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/fetch/workflows/ci/badge.svg)](https://github.com/waitingsong/fetch/actions?query=workflow%3A%22ci%22)
[![codecov](https://codecov.io/gh/waitingsong/rxxfetch/branch/master/graph/badge.svg?token=v1yioFcT20)](https://codecov.io/gh/waitingsong/rxxfetch)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)


## Installing

```bash
npm install @waiting/fetch
```

## Usage

### GET JSON

```ts
import { get } from '@waiting/fetch'

const url = 'https://httpbin.org/get'
const ret = await get<HttpbinGetResponse>(url, args).subscribe(

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

### POST

#### JSON
```ts
import { post, RxRequestInit } from '@waiting/fetch'

const url = 'https://httpbin.org/post'
const pdata = {
  cn: '测试',
  p1: Math.random(),
  p2: Math.random().toString(),
  p3: {
    foo: Math.random() + '',
  },
}
const args: RxRequestInit = {}
args.data = { ...pdata }

const res = await post<HttpbinPostResponse>(url, args)
assert(res && res.url === url)

const json: typeof pdata = res.json
assert(json.cn === pdata.cn, `Should got "${pdata.cn}"`)
assert(json.p1 === pdata.p1, `Should got "${pdata.p1}"`)
assert(json.p2 === pdata.p2, `Should got "${pdata.p2}"`)
assert(json.p3.foo === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
```


### `PUT` `REMOVE` goto [TEST](https://github.com/waitingsong/rxxfetch/tree/master/test_browser)


## Packages

| Package                               | Version                  | Dependencies                   | DevDependencies                  |
| ------------------------------------- | ------------------------ | ------------------------------ | -------------------------------- |
| [`@waiting/fetch`][`fetch`]           | [![fetch-svg]][fetch-ch] | [![fetch-d-svg]][fetch-d-link] | [![fetch-dd-svg]][fetch-dd-link] |
| [`@mw-components/fetch`][`com-fetch`] | [![com-svg]][com-ch]     | [![com-d-svg]][com-d-link]     | [![com-dd-svg]][com-dd-link]     |



## License

[MIT](LICENSE)


<br>

[`fetch`]: https://github.com/waitingsong/fetch/tree/master/packages/fetch
[fetch-svg]: https://img.shields.io/npm/v/@waiting/fetch.svg?maxAge=86400
[fetch-ch]: https://github.com/waitingsong/fetch/tree/master/packages/fetch/CHANGELOG.md
[fetch-d-svg]: https://david-dm.org/waitingsong/fetch.svg?path=packages/fetch
[fetch-d-link]: https://david-dm.org/waitingsong/fetch.svg?path=packages/fetch
[fetch-dd-svg]: https://david-dm.org/waitingsong/fetch/dev-status.svg?path=packages/fetch
[fetch-dd-link]: https://david-dm.org/waitingsong/fetch?path=packages/fetch#info=devDependencies

[`com-fetch`]: https://github.com/waitingsong/fetch/tree/master/packages/midway-component-fetch
[com-svg]: https://img.shields.io/npm/v/@mw-components/fetch.svg?maxAge=86400
[com-ch]: https://github.com/waitingsong/fetch/tree/master/packages/midway-component-fetch/CHANGELOG.md
[com-d-svg]: https://david-dm.org/waitingsong/fetch.svg?path=packages/midway-component-fetch
[com-d-link]: https://david-dm.org/waitingsong/fetch.svg?path=packages/midway-component-fetch
[com-dd-svg]: https://david-dm.org/waitingsong/fetch/dev-status.svg?path=packages/midway-component-fetch
[com-dd-link]: https://david-dm.org/waitingsong/fetch?path=packages/midway-component-fetch#info=devDependencies

