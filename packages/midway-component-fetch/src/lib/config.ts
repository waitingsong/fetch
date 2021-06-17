import { HeadersKey } from '@mw-components/jaeger'
import { Node_Headers } from '@waiting/fetch'

import { FetchComponentConfig } from './types'


export const defaultFetchComponentConfig: FetchComponentConfig = {
  genRequestHeaders: () => new Node_Headers(),
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

