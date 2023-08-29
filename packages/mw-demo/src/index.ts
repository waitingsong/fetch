
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export {
  getComponentConfig,
  getMiddlewareConfig,
} from './util/common.js'
export * from './middleware/demo.middleware.js'

// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: Partial<Config>
    [ConfigKey.middlewareConfig]: Partial<MiddlewareConfig>
  }
}

