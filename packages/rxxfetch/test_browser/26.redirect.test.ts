import {
  get,
  post,
  RxRequestInit,
} from '../src/index'
import { HttpbinGetResponse } from '../test/model'

import { DELAY, HOST_GET, HOST_REDIRECT, HOST_STATUS } from './config'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = '30_redirect.test.ts'

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  const initArgs = {
    keepRedirectCookies: true, // ignored on browser
  } as RxRequestInit

  describe.skip('Should handle 303 redirect correctly with keepRedirectCookies:true', () => {
    it('Should post() be redirected to get() (ignore value of keepRedirectCookies)', (resolve) => {
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

  describe('Should handle multiple redirect correctly (ignore value of keepRedirectCookies)', () => {
    const times = 2

    it(`times: ${times} with keepRedirectCookies:true`, (resolve) => {
      const url = HOST_REDIRECT + '/' + times.toString()
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
      const url = HOST_REDIRECT + '/' + times.toString()
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
