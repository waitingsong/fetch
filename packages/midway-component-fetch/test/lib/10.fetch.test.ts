import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  it('Should work', async () => {
    const { httpRequest, app } = testConfig

    const path = `${apiBase.fetch}/${apiMethod.ip}`
    const resp = await httpRequest
      .get(path)

    assert(resp.ok, resp.text)
    const ip = resp.text
    console.log({ ip })
    assert(typeof ip === 'string')
    assert(ip.length > 0)
    assert(/[\d.]+/u.test(ip))
  })

  it.skip('Should work self', async () => {
    const { httpRequest } = testConfig

    const path = `${apiBase.fetch}/${apiMethod.self}`
    const resp = await httpRequest
      .get(path)

    assert(resp.ok, resp.text)
    const ip = resp.text
    console.log({ ip })
    assert(typeof ip === 'string')
  })

})

