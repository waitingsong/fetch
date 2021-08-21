import { HeadersKey } from '@mw-components/jaeger'

import { genRequestHeaders } from './helper'
import { FetchComponentConfig } from './types'


export const defaultFetchComponentConfig: FetchComponentConfig = {
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
  ],
}

