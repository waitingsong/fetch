import { HeadersKey } from '@mw-components/jaeger'

import { genRequestHeaders } from './helper'
import { FetchComponentConfig } from './types'


export const defaultFetchComponentConfig: FetchComponentConfig = {
  genRequestHeaders,
  enableDefaultCallbacks: true,
  enableTraceLoggingReqBody: true,
  enableTraceLoggingRespData: true,
  traceLoggingReqHeaders: [
    'authorization',
    'user-agent',
    HeadersKey.reqId,
  ],
  traceLoggingRespHeaders: [
    'content-type',
    'server',
    'x-aspnet-version',
    'x-powered-by',
  ],
}

