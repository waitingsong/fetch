import { defaultFetchComponentConfig } from '../lib/config'
import { FetchComponentConfig } from '../lib/types'


export const fetch: FetchComponentConfig = {
  ...defaultFetchComponentConfig,
  enableDefaultCallbacks: false,
  enableTraceLoggingReqBody: true,
  enableTraceLoggingRespData: true,
}

