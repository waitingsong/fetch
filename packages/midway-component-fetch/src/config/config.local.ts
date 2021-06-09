import { Node_Headers } from '@waiting/fetch'

import { FetchComponentConfig } from '../lib/types'


export const fetch: FetchComponentConfig = {
  genRequestHeaders: () => new Node_Headers(),
  enableDefaultCallbacks: false,
  enableTraceLoggingReqBody: true,
  enableTraceLoggingRespData: true,
}

