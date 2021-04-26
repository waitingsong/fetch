/* eslint-disable node/no-unpublished-import */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent } from 'egg'

import { bindOnAppOrAgent } from './lib/bind'
import { pluginName } from './lib/config'
import { parseConfig } from './lib/util'


/* istanbul ignore next */
export default (agent: Agent): void => {
  const config = parseConfig(agent.config[pluginName])

  agent.config[pluginName].agent = config.agent

  if (config.agent) {
    bindOnAppOrAgent(agent)
  }
}

