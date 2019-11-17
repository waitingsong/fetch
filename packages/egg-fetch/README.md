# [egg-fetch]

[RxxFetch](https://www.npmjs.com/package/rxxfetch) for midway/egg framework.


[![Version](https://img.shields.io/npm/v/@waiting/egg-fetch.svg)](https://www.npmjs.com/package/@waiting/egg-fetch)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![](https://img.shields.io/badge/lang-TypeScript-blue.svg)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## Installation
```sh
npm i @waiting/egg-fetch
```


## Configuration

### Enable Plugin

Edit `${app_root}/src/config/plugin.ts`:

```ts
export const fetch = {
  enable: true,
  package: '@waiting/egg-fetch',
}
```

### Add Configurations

```ts
/* location: ${app_root}/src/config/config.${env}.ts */

import { FetchConfig } from '@waiting/egg-fetch'

export const fetch: FetchConfig = {
  client: {
    timeout: 60 * 1000, // ms
  },
}
```


## Usage

```ts
import { provide, plugin } from 'midway'
import { Fetch, JsonType, RxRequestInit } from '@waiting/egg-fetch'

@provide()
export class UserService {

  constructor(
    @plugin() private readonly fetch: Fetch,
  ) { }

  @get('/test_json')
  async public testJson(ctx: Context) {
    const url = 'https://httpbin.org/get'
    const json = await this.fetch.get<HttpbinGetResponse>(url).toPromise()
    ctx.body = `\nurl: ${json.url}`
  }

  @get('/test_html')
  async public testHtml(ctx: Context) {
    const url = 'https://httpbin.org/get'
    const args: RxRequestInit = {
      dataType: 'text'
    }
    const html = await this.fetch.get<string>(url, args).toPromise()
    ctx.body = `\nhtml: ${html}`
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
```


## Documentation
- [egg-fetch]
- [Rxxfetch]


## License
[MIT](LICENSE)


### Languages
- [English](README.md)
- [中文](README.zh-CN.md)



[egg-fetch]: https://waitingsong.github.io/egg-fetch/
[Rxxfetch]: https://waitingsong.github.io/rxxfetch/

