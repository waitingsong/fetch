import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { post, Options, ContentTypeList } from '../src/index.js'

import { DELAY, HOST_POST } from './config.js'
import { HttpbinPostResponse } from './test.types.js'


describe(fileShortPath(import.meta.url), function() {

  this.retries(3)
  beforeEach(done => setTimeout(done, DELAY))

  describe('Should post() work with httpbin.org', () => {
    const url = HOST_POST
    const initOpts = {
      contentType: ContentTypeList.json,
    } as Options

    it('send json with content-type: application/json; charset=utf-8', async () => {
      const pdata = {
        cn: '测试',
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: {
          foo: Math.random().toString(),
        },
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await post<HttpbinPostResponse<typeof pdata>>(url, opts)
      assert(res && res.url === url)

      if (res) {
        const json: typeof pdata = res.json
        assert(json.cn === pdata.cn, `Should got "${pdata.cn}"`)
        assert(json.p1 === pdata.p1, `Should got "${pdata.p1}"`)
        assert(json.p2 === pdata.p2, `Should got "${pdata.p2}"`)
        assert(json.p3.foo === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
      }
    })
  })

})

