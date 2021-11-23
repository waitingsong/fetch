import { relative } from 'path'

import {
  get,
  post,
  Options,
} from '../src/index'
import { patchedFetch, Node_Headers } from '../src/lib/patch'

import {
  DELAY,
  HOST_ABSOLUTE_REDIRECT,
  HOST_GET,
  HOST_REDIRECT,
  HOST_STATUS,
} from './config'
import { HttpbinGetResponse } from './test.types'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

// skip while https://github.com/postmanlabs/httpbin/issues/617

describe.skip(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  const initOpts: Options = {
    url: '',
    method: 'POST',
    credentials: 'include',
    fetchModule: patchedFetch,
    headersInitClass: Node_Headers,
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
