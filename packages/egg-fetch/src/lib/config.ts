import { FetchConfig } from './model'


export const pluginName = 'fetch'

export const initialConfig: Readonly<FetchConfig> = {
  agent: true,
  app: true,
  client: { timeout: 3 * 60 * 1000 },
}
