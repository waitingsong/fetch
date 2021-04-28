import type { Fetch } from './fetch'
import type { FetchEggConfig } from './types'


export * from './config'
export * from './util'
export {
  // ClientOptions,
  FetchEggConfig,
} from './types'

export { Fetch } from './fetch'

declare module 'egg' {
  interface Application {
    fetch: Fetch
  }

  interface Agent {
    fetch: Fetch
  }

  interface EggAppConfig {
    fetch: FetchEggConfig
  }
}

