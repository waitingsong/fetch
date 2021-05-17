import { Node_Headers } from '@waiting/fetch'

import { FetchConfig } from '../lib/types'


export const fetchConfig: FetchConfig = {
  genReqHeadersInit: () => new Node_Headers(),
}

