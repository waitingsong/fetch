/* eslint-disable node/no-unpublished-import */
/* eslint-disable import/no-extraneous-dependencies */
import { Context } from 'egg'

import { FetchComponentConfig } from './types'


export { FetchService } from './fetch'
export { FetchComponentConfig }

declare module 'egg' {
  interface EggAppConfig {
    fetch: FetchComponentConfig
  }
}
declare const dummy: Context

