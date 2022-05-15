import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { get, Options } from '../src/index.js'

import { HOST } from './config.js'
import { HttpbinGetResponse } from './test.types.js'


describe(fileShortPath(import.meta.url), function() {
  this.retries(3)

  describe('Should get() for compressed response work with httpbin.org', () => {
    const initOpts = {
      timeout: 20 * 1000,
    } as Options

    it('brotli', async () => {
      const url = HOST + '/brotli'
      const opts = { ...initOpts }

      const ret = await get<HttpbinGetResponse>(url, opts)
      assert(ret && ret.brotli === true)
    })

    it('deflate', async () => {
      const url = HOST + '/deflate'
      const args = { ...initOpts }

      const ret = await get<HttpbinGetResponse>(url, args)
      assert(ret && ret.deflated === true)
    })

    it('gzip', async () => {
      const url = HOST + '/gzip'
      const args = { ...initOpts }

      const ret = await get<HttpbinGetResponse>(url, args)
      assert(ret && ret.gzipped === true)
    })
  })

})

