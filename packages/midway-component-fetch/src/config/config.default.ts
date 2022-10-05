import { Config, MiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config'


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

