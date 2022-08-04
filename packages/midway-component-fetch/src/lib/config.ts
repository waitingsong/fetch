import { HeadersKey, TracerTag } from '@mw-components/jaeger'

import { genRequestHeaders } from './helper'
import { Config, MiddlewareConfig, MiddlewareOptions } from './types'


export const initialConfig: Readonly<Config> = {
  genRequestHeaders,
  enableDefaultCallbacks: true,
  enableTraceLoggingReqBody: true,
  enableTraceLoggingRespData: true,
  traceLoggingReqHeaders: [
    'Accept',
    'authorization',
    'Content-Length',
    'Date',
    'Host',
    'user-agent',
    HeadersKey.reqId,
    HeadersKey.traceId,
    TracerTag.svcName,
    TracerTag.svcVer,
  ],
  traceLoggingRespHeaders: [
    'Age',
    'Cache-Control',
    'Content-Encoding',
    'Content-Length',
    'content-type',
    'Date',
    'Location',
    'server',
    'x-aspnet-version',
    'x-powered-by',
    HeadersKey.reqId,
    HeadersKey.traceId,
    TracerTag.svcName,
    TracerTag.svcVer,
  ],
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export enum ConfigKey {
  namespace = 'fetch',
  config = 'fetchConfig',
  middlewareConfig = 'fetchMiddlewareConfig',
  componentName = 'fetchComponent',
  middlewareName = 'fetchMiddleware'
}

