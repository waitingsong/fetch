import {
  initMiddlewareOptions,
  initialConfig,
  initialMiddlewareConfig,
} from '../lib/config.js'
import type { Config, MiddlewareConfig } from '../lib/types.js'


export const fetchConfig: Config = {
  ...initialConfig,
  captureRequestHeaders: [...initialConfig.captureRequestHeaders],
  captureResponseHeaders: [...initialConfig.captureResponseHeaders],
  enableTrace: true,
}

export const fetchMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [],
  options: {
    ...initMiddlewareOptions,
  },
}

