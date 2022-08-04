# midway-component-fetch

HTTP fetch component for midway.js

[![Version](https://img.shields.io/npm/v/midway-component-fetch.svg)](https://www.npmjs.com/package/midway-component-fetch)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## Install

```sh
npm i midway-component-fetch
```

## Usage

Update project `src/configuration.ts`
```ts
import * as fetch from 'midway-component-fetch'

@Configuration({
  imports: [
    fetch,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class ContainerConfiguration implements ILifeCycle {
}
```

Update project `src/config/config.(prod | local | unittest).ts`
```ts
import { FetchComponentConfig, genRequestHeaders } from 'midway-component-fetch'

export const fetch: FetchComponentConfig = {
  // change to only authorization
  traceLoggingReqHeaders: ['authorization'],
}
```

Update project base service like `src/core/base.service.ts`
```ts
import { Inject } from '@midwayjs/decorator'
import {
  FetchComponent,
  FetchResponse,
  Options as FetchOptions,
} from 'midway-component-fetch'

export class BaseService extends RootClass {
  @Inject() readonly fetch: FetchComponent

  /**
   * 返回类型为 `text` 或者 `html`
   */
  getText<T extends string = string>(
    url: string,
    data?: FetchOptions['data'],
  ): Promise<T> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      dataType: 'text',
    }
    if (typeof data !== 'undefined') {
      opts.data = data
    }
    const ret = this.fetch.get<T>(url, opts)
    return ret as Promise<T>
  }

  /**
   * Generate an RxRequestInit variable,
   * @default
   *   - contentType: 'application/json; charset=utf-8'
   *   - dataType: 'json'
   */
  get initFetchOptions(): FetchOptions {
    const args: FetchOptions = {
      url: '',
      method: 'GET',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
    }
    return args
  }
}
```


Update project service like `src/home/home.service.ts`
```ts
import { Provide } from '@midwayjs/decorator'

import { BaseService } from '~/interface'


@Provide()
export class HomeService extends BaseService {

  /**
   * 获取网关 IP
   */
  async retrieveGatewayIp(): Promise<string> {
    const url = 'https://www.taobao.com/help/getip.php'
    // ipCallback({ip:"222.233.10.1"})
    const text = await this.getText(url)
    let ip = ''
    if (text) {
      const arr = /"([\d.]+)"/ui.exec(text)
      ip = arr && arr.length >= 1 && arr[1] ? arr[1] : ''
    }
    this.logger.info({ ip })
    return ip
  }

}
```


## License

[MIT](LICENSE)

