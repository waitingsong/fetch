/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { post, RxRequestInit, ContentTypeList } from '../src/index'
import { HttpbinPostResponse } from '../test/model'

import { DELAY, HOST_POST } from './config'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = '21_post-json.test.ts'

describe(filename, function() {
  this.retries(3)
  beforeEach(done => setTimeout(done, DELAY))

  describe('Should post() works with httpbin.org', () => {
    const url = HOST_POST
    const initArgs: RxRequestInit = {
      contentType: ContentTypeList.json,
    }

    it('send json with content-type: application/json; charset=utf-8', async () => {
      const pdata = {
        cn: '测试',
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: {
          foo: Math.random().toString(),
        },
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      const res = await post<HttpbinPostResponse>(url, args).toPromise()
      assert(res && res.url === url)

      const json: typeof pdata = res.json
      assert(json.cn === pdata.cn, `Should got "${pdata.cn}"`)
      assert(json.p1 === pdata.p1, `Should got "${pdata.p1}"`)
      assert(json.p2 === pdata.p2, `Should got "${pdata.p2}"`)
      assert(json.p3.foo === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
    })
  })

})

