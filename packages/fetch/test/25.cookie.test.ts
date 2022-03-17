import assert from 'assert/strict'
import { relative } from 'path'

import { Args, get, Options } from '../src/index'
import { patchedFetch, Node_Headers } from '../src/lib/patch'

import { DELAY, HOST, HOST_COOKIES } from './config'
import { HttpbinRetCookie } from './test.types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

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
      assert(res.cookies.foo === value)
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
