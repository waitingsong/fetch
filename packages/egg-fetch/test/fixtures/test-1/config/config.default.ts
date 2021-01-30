/* eslint-disable node/no-unpublished-import */
import { FetchEggConfig } from '../../../../dist/index'


export const keys = '123456'

export const fetch: FetchEggConfig = {
  client: {
    timeout: 3 * 60 * 1000,
  },
}

