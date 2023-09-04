import { HeadersKey, AttrNames } from '@mwcp/otel'

import { genRequestHeaders } from './helper.js'
import { Config, MiddlewareConfig, MiddlewareOptions } from './types.js'


export const initialConfig: Readonly<Config> = {
  genRequestHeaders,
  enableTrace: true,
  traceEvent: true,
  traceRequestBody: true,
  traceResponseData: true,
  captureRequestHeaders: [
    'Accept',
    'authorization',
    'Content-Length',
    'Date',
    'Host',
    'user-agent',
    HeadersKey.reqId,
    AttrNames.ServiceName,
    AttrNames.ServiceVersion,
  ],
  captureResponseHeaders: [
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
    AttrNames.ServiceName,
    AttrNames.ServiceVersion,
  ],
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

