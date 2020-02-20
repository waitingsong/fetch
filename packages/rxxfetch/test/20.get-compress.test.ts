import {
  ab2str,
  basename,
} from '@waiting/shared-core'
import * as assert from 'power-assert'

import { get, RxRequestInit } from '../src/index'

import { HttpbinGetResponse } from './model'


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)

  describe('Should get() for compressed response works with httpbin.org', () => {
    const initArgs = {
      timeout: 20 * 1000,
    } as RxRequestInit

    it('brotli', async () => {
      const url = 'https://httpbin.org/brotli'
      const args = { ...initArgs }

      const ret = await get<HttpbinGetResponse>(url, args).toPromise()
      assert(ret.brotli === true)
    })

    it('deflate', async () => {
      const url = 'https://httpbin.org/deflate'
      const args = { ...initArgs }

      const ret = await get<HttpbinGetResponse>(url, args).toPromise()
      assert(ret.deflated === true)
    })

    it('gzip', async () => {
      const url = 'https://httpbin.org/gzip'
      const args = { ...initArgs }

      const ret = await get<HttpbinGetResponse>(url, args).toPromise()
      assert(ret.gzipped === true)
    })
  })

})

