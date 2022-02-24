import assert from 'assert'
import { relative } from 'path'

import { testConfig, TestRespBody } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/'

  it('Should work', async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
    const ret = resp.body as TestRespBody
    const { url, header } = ret
    const { host } = header
    assert(url === '/')
    assert(host && testConfig.host.includes(host))
  })

})

