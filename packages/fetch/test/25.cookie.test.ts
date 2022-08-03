import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { Args, get, Options } from '../src/index.js'
import { patchedFetch, Node_Headers } from '../src/lib/patch.js'

import { DELAY, HOST, HOST_COOKIES } from './config.js'
import { HttpbinRetCookie } from './test.types.js'


describe(fileShortPath(import.meta.url), function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  assert(patchedFetch)
  const initOpts: Options = {
    url: '',
    method: 'GET',
    credentials: 'include',
    fetchModule: patchedFetch,
    headersInitClass: Node_Headers,
    keepRedirectCookies: true, // intercept redirect
  }

  describe('Should work with keepRedirectCookies:true', () => {
    it('set by get()', async () => {
      const value = Math.random().toString()
      const url = HOST_COOKIES + '/set/foo/' + value
      const opts = { ...initOpts }

      const res = await get<HttpbinRetCookie>(url, opts)
      assert(res && res.cookies)
      assert(res.cookies['foo'] === value)
    })
  })

  describe('Should work with keepRedirectCookies:false', () => {
    it('retrieve cookies with bare:true and redirect:"manual"', async () => {
      const value = Math.random().toString()
      const url = HOST_COOKIES + '/set/foo/' + value
      const opts = { ...initOpts }

      opts.dataType = 'bare'
      opts.redirect = 'manual' // !
      opts.keepRedirectCookies = false

      const res = await get<Response>(url, opts)
      assert(res && ! res.ok)
      const cookies = res.headers.get('Set-Cookie')
      assert(cookies && cookies.includes(`foo=${value};`))
    })

    it('retrieve cookies with bare:true', async () => {
      const value = Math.random().toString()
      const url = HOST_COOKIES + '/set/foo/' + value
      const args = { ...initOpts }

      args.dataType = 'bare'
      args.keepRedirectCookies = false

      const res = await get<Response>(url, args)
      assert(res && res.ok)
      const cookies = res.headers.get('Set-Cookie')
      assert(! cookies)
    })
  })

})
