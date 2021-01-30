import { basename } from '@waiting/shared-core'
import nodefetch, { Headers } from 'node-fetch'

import {
  get,
  post,
  RxRequestInit,
} from '../src/index'

import { DELAY, HOST_ABSOLUTE_REDIRECT, HOST_GET, HOST_REDIRECT, HOST_STATUS } from './config'
import { HttpbinGetResponse } from './model'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

// skip while https://github.com/postmanlabs/httpbin/issues/617

describe.skip(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  const initArgs = {
    fetchModule: nodefetch,
    headersInitClass: Headers,
    keepRedirectCookies: true, // intercept redirect
  } as RxRequestInit

  describe('Should handle 303 redirect correctly with keepRedirectCookies:true', () => {
    it('Should post() be redirected to get()', (resolve) => {
      const url = HOST_STATUS + '/303'
      const args = { ...initArgs }

      post<HttpbinGetResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === HOST_GET, `Should redirected to url: "${HOST_GET}" by GET`)
          resolve()
        },
        (err) => {
          assert(false, err)
        },
      )
    })
  })

  describe('Should handle multiple redirect correctly', () => {
    const times = 2

    it(`times: ${times} with keepRedirectCookies:true`, (resolve) => {
      const url = HOST_ABSOLUTE_REDIRECT + '/' + times.toString()
      const args = { ...initArgs }

      get<HttpbinGetResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === HOST_GET)
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it(`times: ${times} with keepRedirectCookies:false`, (resolve) => {
      const url = HOST_ABSOLUTE_REDIRECT + '/' + times.toString()
      const args = { ...initArgs }
      args.keepRedirectCookies = false

      get<HttpbinGetResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === HOST_GET)
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })
  })

})
