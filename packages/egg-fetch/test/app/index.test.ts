/* eslint-disable node/no-extraneous-require */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { basename } from '@waiting/shared-core'
import * as mm from 'egg-mock'
import * as request from 'supertest'

import { initialConfig, pluginName, FetchEggConfig as PluginConfig } from '../../src/index'
import { fetch as testConfig } from '../fixtures/test-1/config/config.default'


const assert = require('power-assert')


const filename = basename(__filename)

describe(filename, () => {
  let app
  let agent
  const baseDir = 'test-1'

  before(() => {
    // @ts-expect-error
    app = mm.app({
      baseDir,
    })
    return app.ready()
  })
  beforeEach(() => {
    agent = request.agent(app.callback())
  })
  // @ts-expect-error
  afterEach(mm.restore)
  after(() => app.close())


  it('should config correct', () => {
    assert(app.config && app.config[pluginName])

    const config: PluginConfig = app.config[pluginName]
    if (typeof testConfig.appWork === 'undefined') {
      assert(config.appWork === initialConfig.appWork)
    }
    else {
      assert(config.appWork === testConfig.appWork)
    }

    if (typeof testConfig.agent === 'undefined') {
      assert(config.agent === initialConfig.agent)
    }
    else {
      assert(config.agent === testConfig.agent)
    }
  })


  it('should get a ctx', () => {
    const ctx = app.mockContext()
    assert(ctx.method === 'GET')
    assert(ctx.url === '/')
  })

  it('should GET / ', async () => {
    const resp = await app.httpRequest()
      .get('/')
      .expect(200)
      .expect(`hi, ${pluginName}`)

    // const msg: string = resp.error.text
    assert(resp)
  })

  it('should GET /ping', async () => {
    const resp = await app.httpRequest()
      .get('/ping')
      .expect(200)
      .expect(`hi, ${pluginName}`)

    assert(resp)
  })

})

