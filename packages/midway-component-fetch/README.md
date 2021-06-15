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
  enableTraceLoggingReqBody: true,
  enableTraceLoggingRespData: true,
  enableDefaultCallbacks: true,
  traceLoggingReqHeaders: ['authorization'],
  genRequestHeaders,
}
```


## License

[MIT](LICENSE)

