/// <reference types="mocha" />

import { basename } from '@waiting/shared-core'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'

import {
  get,
  RxRequestInit,
} from '../src/index'

import { HttpbinRetCookie } from './model'


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  const initArgs = <RxRequestInit> {
    credentials: 'include',
    fetchModule: nodefetch,
    headersInitClass: Headers,
    keepRedirectCookies: true, // intercept redirect
  }

  describe('Should works with keepRedirectCookies:true', () => {
    it('set by get()', (resolve) => {
      const value = Math.random().toString()
      const url = 'https://httpbin.org/cookies/set/foo/' + value
      const args = { ...initArgs }

      get<HttpbinRetCookie>(url, args).subscribe(
        (next) => {
          assert(next && next.cookies)
          assert(next.cookies.foo === value)
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })
  })

  describe('Should works with keepRedirectCookies:false', () => {
    it('retrieve cookies with bare:true and redirect:"manual"', (resolve) => {
      const value = Math.random().toString()
      const url = 'https://httpbin.org/cookies/set/foo/' + value
      const args = { ...initArgs }

      args.dataType = 'bare'
      args.redirect = 'manual' // !
      args.keepRedirectCookies = false

      get<Response>(url, args).subscribe(
        (res) => {
          assert(res && ! res.ok)
          const cookies = res.headers.get('Set-Cookie')
          assert(cookies && cookies.includes(`foo=${value};`))
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('retrieve cookies with bare:true', (resolve) => {
      const value = Math.random().toString()
      const url = 'https://httpbin.org/cookies/set/foo/' + value
      const args = { ...initArgs }

      args.dataType = 'bare'
      args.keepRedirectCookies = false

      get<Response>(url, args).subscribe(
        (res) => {
          assert(res && res.ok)
          const cookies = res.headers.get('Set-Cookie')
          assert(! cookies)
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
