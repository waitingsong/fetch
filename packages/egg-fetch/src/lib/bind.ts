/* istanbul ignore file */
import assert from 'assert'

// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent, Application } from 'egg'

import { pluginName } from './config'
import { Fetch } from './fetch'
import { FetchEggConfig } from './types'


export function bindOnAppOrAgent(app: Application | Agent): void {
  app.addSingleton(pluginName, createOneClient)
}

function createOneClient(options: FetchEggConfig['client'], app: Application | Agent): Fetch {
  const opts: FetchEggConfig['client'] = { ...options }
  assert(Object.keys(opts).length, `[egg-${pluginName}] config empty`)

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
