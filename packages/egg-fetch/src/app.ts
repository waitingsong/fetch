/* eslint-disable node/no-unpublished-import */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Application } from 'egg'

import { bindOnAppOrAgent } from './lib/bind'
import { pluginName } from './lib/config'
import { parseConfig } from './lib/util'


/* istanbul ignore next */
export default (app: Application): void => {
  const config = parseConfig(app.config[pluginName])

  app.config[pluginName].appWork = config.appWork

  if (config.appWork) {
    bindOnAppOrAgent(app)
  }
}

