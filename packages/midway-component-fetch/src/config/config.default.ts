import { defaultFetchComponentConfig } from '../lib/config'
import { FetchComponentConfig } from '../lib/types'


export const fetch: FetchComponentConfig = {
  ...defaultFetchComponentConfig,
  traceLoggingReqHeaders: [...defaultFetchComponentConfig.traceLoggingReqHeaders],
  traceLoggingRespHeaders: [...defaultFetchComponentConfig.traceLoggingRespHeaders],
}

