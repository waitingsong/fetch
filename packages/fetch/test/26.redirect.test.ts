import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import type { Options } from '../src/index.js'
import {
  get,
  post,
} from '../src/index.js'

import {
  DELAY,
  HOST_ABSOLUTE_REDIRECT,
  HOST_GET,
  HOST_STATUS,
} from './config.js'
import type { HttpbinGetResponse } from './test.types.js'


// skip while https://github.com/postmanlabs/httpbin/issues/617
describe.skip(fileShortPath(import.meta.url), function () {
  this.retries(1)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  const initOpts: Options = {
    url: '',
    method: 'POST',
    credentials: 'include',
    keepRedirectCookies: true, // intercept redirect
  }

  describe('Should handle 303 redirect correctly with keepRedirectCookies:true', () => {
    it('Should post() be redirected to get()', async () => {
      const url = HOST_STATUS + '/303'
      const args = { ...initOpts }

      const res = await post<HttpbinGetResponse>(url, args)
      assert(res && res.url === HOST_GET, `Should redirected to url: "${HOST_GET}" by GET`)
    })
  })

  describe('Should handle multiple redirect correctly', () => {
    const times = 2

    it(`times: ${times} with keepRedirectCookies:true`, async () => {
      const url = HOST_ABSOLUTE_REDIRECT + '/' + times.toString()
      const args = { ...initOpts }

      const res = await get<HttpbinGetResponse>(url, args)
      assert(res && res.url === HOST_GET)
    })

    it(`times: ${times} with keepRedirectCookies:false`, async () => {
      const url = HOST_ABSOLUTE_REDIRECT + '/' + times.toString()
      const args = { ...initOpts }
      args.keepRedirectCookies = false

      const res = await get<HttpbinGetResponse>(url, args)
      assert(res && res.url === HOST_GET)
    })
  })

})
