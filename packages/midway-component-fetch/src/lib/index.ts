/* eslint-disable node/no-unpublished-import */
/* eslint-disable import/no-extraneous-dependencies */
import type { Context } from 'egg'

import { FetchComponentConfig } from './types'


export { FetchService } from './fetch'
export {
  defaultfetchConfigCallbacks, genRequestHeaders,
} from './helper'
export { FetchComponentConfig }

declare module 'egg' {
  interface EggAppConfig {
    fetch: FetchComponentConfig
  }
}
declare const dummy: Context

