/// <reference types="mocha" />

import { basename } from '@waiting/shared-core'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'

import {
  get,
  post,
  RxRequestInit,
} from '../src/index'

import { HttpbinGetResponse } from './model'


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  const initArgs = {
    fetchModule: nodefetch,
    headersInitClass: Headers,
    keepRedirectCookies: true, // intercept redirect
  } as RxRequestInit

  describe('Should handle 303 redirect correctly with keepRedirectCookies:true', () => {
    it('Should post() be redirected to get()', (resolve) => {
      const url = 'https://httpbin.org/status/303'
      const args = { ...initArgs }

      post<HttpbinGetResponse>(url, args).subscribe(
        (res) => {
          const resUrl = 'https://httpbin.org/get'
          assert(res && res.url === resUrl, `Should redirected to url: "${resUrl}" by GET`)
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
      const url = 'https://httpbin.org/redirect/' + times
      const args = { ...initArgs }

      get<HttpbinGetResponse>(url, args).subscribe(
        (res) => {
          const resUrl = 'https://httpbin.org/get'
          assert(res && res.url === resUrl)
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it(`times: ${times} with keepRedirectCookies:false`, (resolve) => {
      const url = 'https://httpbin.org/redirect/' + times
      const args = { ...initArgs }
      args.keepRedirectCookies = false

      get<HttpbinGetResponse>(url, args).subscribe(
        (res) => {
          const resUrl = 'https://httpbin.org/get'
          assert(res && res.url === resUrl)
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
