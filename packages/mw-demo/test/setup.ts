// https://mochajs.org/#global-fixtures
// https://mochajs.org/#root-hook-plugins
import assert from 'node:assert/strict'

import * as WEB from '@midwayjs/koa'
import { createApp, close, createHttpRequest } from '@midwayjs/mock'
import { Application } from '@mwcp/share'
import type { Suite } from 'mocha'

import { TestConfig, testConfig } from './root.config.js'


let app: Application

export async function mochaGlobalSetup(this: Suite) {
  app = await createAppInstance()
  await updateConfig(app, testConfig)
}

export async function mochaGlobalTeardown(this: Suite) {
  await close(app)
}


/**
 * Update testConfig in place
 */
async function createAppInstance(): Promise<Application> {
  const globalConfig = {
    keys: Math.random().toString(),
  }
  const opts = {
    imports: [WEB],
    globalConfig,
  }

  try {
    app = await createApp(testConfig.testAppDir, opts) as Application
  }
  catch (ex) {
    console.error('createApp error:', ex)
    throw ex
  }

  assert(app, 'app not exists')
  app.addConfigObject(globalConfig)

  const names = app.getMiddleware().getNames()
  console.info({ middlewares: names })

  return app
  // https://midwayjs.org/docs/testing
}

async function updateConfig(mockApp: Application, config: TestConfig): Promise<void> {
  config.app = mockApp
  config.httpRequest = createHttpRequest(mockApp)

  assert(config.httpRequest, 'httpRequest not exists')
  const { url } = config.httpRequest.get('/')
  config.host = url

  config.container = mockApp.getApplicationContext()
  // const svc = await testConfig.container.getAsync(TaskQueueService)
}
