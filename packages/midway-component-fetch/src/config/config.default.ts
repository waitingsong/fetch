import { Node_Headers } from '@waiting/fetch'

import { FetchConfig } from '../lib/types'


export const fetchConfig: FetchConfig = {
  genRequestHeaders: () => new Node_Headers(),
}

