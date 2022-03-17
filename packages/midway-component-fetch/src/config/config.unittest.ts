import { Config, MiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config'


export const fetchConfig: Config = {
  ...initialConfig,
  enableTraceLoggingReqBody: false,
  enableTraceLoggingRespData: false,
  traceLoggingReqHeaders: [],
  traceLoggingRespHeaders: [],
}

export const fetchMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [], // !
  options: {
    ...initMiddlewareOptions,
  },
}

