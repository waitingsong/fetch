// eslint-disable-next-line import/no-extraneous-dependencies
import { Application } from 'egg'

import { bindFetchOnAppOrAgent } from './lib/bind'
import { pluginName } from './lib/config'
import { FetchConfig } from './lib/model'


/* istanbul ignore next */
export default (app: Application) => {
  const config: FetchConfig = app.config[pluginName]

  config.app && bindFetchOnAppOrAgent(app)
}
