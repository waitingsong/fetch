import type {
  Config,
  ConfigKey,
} from './lib/index.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'

export {
  type HeadersInit,
  type ResponseData,
  type RequestInfo,
  type RequestInit,
  ContentTypeList,
  FormData,
  Headers,
  Response,
  pickUrlStrFromRequestInfo,
} from '@waiting/fetch'

export { retrieveHeadersItem } from '@waiting/shared-core'
export type {
  JsonResp,
  JsonType,
  JsonObject,
} from '@waiting/shared-types'


declare module '@midwayjs/core/dist/interface.js' {
  interface MidwayConfig {
    [ConfigKey.config]: Partial<Config>
  }
}
