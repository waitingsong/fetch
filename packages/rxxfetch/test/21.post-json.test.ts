/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { basename } from '@waiting/shared-core'

import { post, RxRequestInit, ContentTypeList } from '../src/index'

import { HttpbinPostResponse } from './model'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(done => setTimeout(done, 2000))

  describe('Should post() works with httpbin.org', () => {
    const url = 'https://httpbin.org/post'
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

