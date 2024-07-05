import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config.js'
import type { Config, MiddlewareConfig } from '../lib/types.js'


export const fetchConfig: Config = {
  ...initialConfig,
  captureRequestHeaders: [...initialConfig.captureRequestHeaders],
  captureResponseHeaders: [...initialConfig.captureResponseHeaders],
}

export const fetchMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [],
  options: {
    ...initMiddlewareOptions,
  },
}

