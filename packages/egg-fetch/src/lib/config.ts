import { ClientOptions, FetchEggConfig } from './types'


export const pluginName = 'fetch'
export const middlewareName = 'fetch'

export const initialClientOptions: Readonly<ClientOptions> = {
  timeout: 3 * 60 * 1000,
}

export const initialEggConfig: Readonly<FetchEggConfig> = {
  appWork: true,
  agent: true,
  enable: false,
  client: {
    ...initialClientOptions,
  },
}

