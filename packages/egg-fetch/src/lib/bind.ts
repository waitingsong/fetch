/* istanbul ignore file */
/* eslint-disable node/no-unpublished-import */
import assert from 'assert'

// eslint-disable-next-line import/no-extraneous-dependencies
import { Agent, Application } from 'egg'

import { pluginName } from './config'
import { Fetch } from './fetch'
import { ClientOptions } from './types'


export function bindOnAppOrAgent(app: Application | Agent): void {
  app.addSingleton(pluginName, createOneClient)
}

function createOneClient(options: ClientOptions, app: Application | Agent): Fetch {
  const opts: ClientOptions = { ...options }
  assert(Object.keys(opts).length, `[egg-${pluginName}] config empty`)

  const client = new Fetch(options)
  app.coreLogger.info(`[egg-${pluginName}] instance status OK`)

  return client
}


declare module 'egg' {
  interface Application {
    fetch: Fetch
  }
  interface Agent {
    fetch: Fetch
  }
}
