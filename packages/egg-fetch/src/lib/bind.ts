import * as assert from 'assert'

// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent, Application } from 'egg'

import { pluginName } from './config'
import { FetchConfig } from './model'
import { Fetch } from './fetch'


export function bindFetchOnAppOrAgent(app: Application | Agent): void {
  assert(
    typeof app[pluginName] === 'undefined',
    `[egg-${pluginName}] Duplication of plugin name found: ${pluginName}. Check loaded plugins.`,
  )
  app.addSingleton(pluginName, createOneClient)

}

function createOneClient(options: FetchConfig['client'], app: Application | Agent): Fetch {
  const opts: FetchConfig['client'] = { ...options }
  assert(opts && Object.keys(opts).length, `[egg-${pluginName}] config empty`)

  const fetch = new Fetch(options)
  app.coreLogger.info(`[egg-${pluginName}] instance status OK`)

  return fetch
}


declare module 'egg' {
  interface Application {
    fetch: Fetch
  }
  interface Agent {
    fetch: Fetch
  }
}
