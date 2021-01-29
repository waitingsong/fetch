// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent } from 'egg'

import { bindFetchOnAppOrAgent } from './lib/bind'
import { pluginName } from './lib/config'
import { FetchConfig } from './lib/types'


/* istanbul ignore next */
export default (agent: Agent) => {
  const config: FetchConfig = agent.config[pluginName]

  config.agent && bindFetchOnAppOrAgent(agent)
}

