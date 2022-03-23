import {
  Config,
  ConfigKey,
} from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'

export {
  Node_Headers,
  initialOptions,
  FetchResponse,
} from '@waiting/fetch'

export { retrieveHeadersItem } from '@waiting/shared-core'
export {
  JsonResp,
  JsonType,
  JsonObject,
} from '@waiting/shared-types'


declare module '@midwayjs/core' {
  interface MidwayConfig {
    [ConfigKey.config]: Config
  }
}
