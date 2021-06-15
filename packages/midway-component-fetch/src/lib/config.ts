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
  ],
  traceLoggingRespHeaders: [
    'content-type',
    'server',
    'x-aspnet-version',
    'x-powered-by',
  ],
}

