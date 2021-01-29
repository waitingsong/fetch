import { RxRequestInit } from 'rxxfetch'


export {
  JsonResp,
  JsonType,
  ObbRetType,
  PlainJsonValue,
  PlainObject,
  RxRequestInit,
} from 'rxxfetch'

export interface FetchConfig {
  /** Enable for agent, Default: true */
  agent?: boolean
  /** Enable for app, Default: true */
  app?: boolean
  client: RxRequestInit
}

