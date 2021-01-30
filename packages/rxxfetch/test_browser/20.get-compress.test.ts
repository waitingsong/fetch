import { get, RxRequestInit } from '../src/index'
import { HttpbinGetResponse } from '../test/model'

import { HOST } from './config'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = '20_get-compress.test.ts'

describe(filename, function() {
  this.retries(3)

  describe('Should get() for compressed response works with httpbin.org', () => {
    const initArgs = {
      timeout: 20 * 1000,
    } as RxRequestInit

    it('brotli', async () => {
      const url = HOST + '/brotli'
      const args = { ...initArgs }

      const ret = await get<HttpbinGetResponse>(url, args).toPromise()
      assert(ret.brotli === true)
    })

    it('deflate', async () => {
      const url = HOST + '/deflate'
      const args = { ...initArgs }

      const ret = await get<HttpbinGetResponse>(url, args).toPromise()
      assert(ret.deflated === true)
    })

    it('gzip', async () => {
      const url = HOST + '/gzip'
      const args = { ...initArgs }

      const ret = await get<HttpbinGetResponse>(url, args).toPromise()
      assert(ret.gzipped === true)
    })
  })

})

