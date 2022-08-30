import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { testConfig } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  it('Should work', async () => {
    const { httpRequest, app } = testConfig

    const path = '/fetch/ip'
    const resp = await httpRequest
      .get(path)
      .expect(200)

    const ip = resp.text as string
    assert(typeof ip === 'string')
    assert(ip.length > 0)
    assert(/[\d.]+/.test(ip))
  })

})
