import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import type { Options } from '../src/index.js'
import { Args, get } from '../src/index.js'

import { DELAY, HOST, HOST_COOKIES } from './config.js'
import type { HttpbinRetCookie } from './test.types.js'


describe(fileShortPath(import.meta.url), function () {
  this.retries(1)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  const initOpts: Options = {
    url: '',
    method: 'GET',
    credentials: 'include',
    keepRedirectCookies: true, // intercept redirect
  }

  // https://httpbin.org/#/Cookies
  describe('Should work with keepRedirectCookies:true', () => {
    it('set by get()', async () => {
      const value = Math.random().toString()
      // /cookies/set/{name}/{value}
      const url = HOST_COOKIES + '/set/foo/' + value
      const opts = { ...initOpts }

      // https://httpbin.org/cookies/set/foo/0.8615462497448882
      const res = await get<HttpbinRetCookie>(url, opts)
      assert(res?.cookies)
      assert(res.cookies['foo'], 'res.cookies[foo] is undefined')
      assert(res.cookies['foo'] === value, `res.cookies['foo']=${res.cookies['foo']}`)
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
      assert(cookies?.includes(`foo=${value};`))
    })

    it('retrieve cookies with bare:true', async () => {
      const value = Math.random().toString()
      const url = HOST_COOKIES + '/set/foo/' + value
      const args = { ...initOpts }

      args.dataType = 'bare'
      args.keepRedirectCookies = false

      const res = await get<Response>(url, args)
      assert(res?.ok)
      const cookies = res.headers.get('Set-Cookie')
      assert(! cookies)
    })
  })

})
