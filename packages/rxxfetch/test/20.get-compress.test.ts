import {
  ab2str,
  basename,
} from '@waiting/shared-core'

import { get, RxRequestInit } from '../src/index'

import { HOST } from './config'
import { HttpbinGetResponse } from './model'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

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

