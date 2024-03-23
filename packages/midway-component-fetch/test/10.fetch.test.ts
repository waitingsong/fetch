import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  it('Should work', async () => {
    const { httpRequest, app } = testConfig

    const path = '/fetch/ip'
    const resp = await httpRequest
      .get(path)
      .expect(200)

    const ip = resp.text
    console.log({ ip })
    assert(typeof ip === 'string')
    assert(ip.length > 0)
    assert(/[\d.]+/u.test(ip))
  })

  it.skip('Should work self', async () => {
    const { httpRequest } = testConfig

    const path = '/fetch/self'
    const resp = await httpRequest
      .get(path)
      .expect(200)

    const ip = resp.text
    console.log({ ip })
    assert(typeof ip === 'string')
  })

})

