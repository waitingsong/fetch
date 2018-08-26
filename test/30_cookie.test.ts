/// <reference types="mocha" />

import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'

import {
  get,
  RxRequestInit,
} from '../src/index'
import { basename } from '../src/shared/index'

import { HttpbinRetCookie } from './model'


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  const initArgs = <RxRequestInit> {
    credentials: 'include',
    fetchModule: nodefetch,
    headersInitClass: Headers,
    keepRedirectCookies: true,  // intercept redirect
  }

  describe('Should works with keepRedirectCookies:true', () => {
    it('by get()', resolve => {
      const value = Math.random().toString()
      const url = 'https://httpbin.org/cookies/set/foo/' + value
      const args = { ...initArgs }

      get<HttpbinRetCookie>(url, args).subscribe(
        next => {
          assert(next && next.cookies)
          assert(next.cookies.foo === value)
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })
  })

})
