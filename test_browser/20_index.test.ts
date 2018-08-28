/// <reference types="mocha" />

import * as assert from 'power-assert'
import { TimeoutError } from 'rxjs'

import {
  buildQueryString,
  fetch,
  get,
  getGloalRequestInit,
  setGloalRequestInit,
  RxRequestInit,
} from '../src/index'
import { httpErrorMsgPrefix, initialRxRequestInit } from '../src/lib/config'

import { HttpbinRetCookie } from '../test/model'


const filename = '20_index.test.ts'
const defaultInit = getGloalRequestInit()

describe(filename, () => {
  afterEach(() => {
    setGloalRequestInit(defaultInit)
  })


  describe('Should getGloalRequestInit() works', () => {
    const initData = getGloalRequestInit()

    it('result is copy of initialRxRequestInit', () => {
      assert(initData && initData !== initialRxRequestInit)
    })

    it('values of result equal to initialRxRequestInit', () => {
      // @ts-ignore
      for (const [key, value] of Object.entries(initData)) {
        if (! (key in initialRxRequestInit)) {
          assert(false, `${key} not exists in initialRxRequestInit`)
          break
        }
        else {
          const d = Object.getOwnPropertyDescriptor(initialRxRequestInit, key)
          assert(d && value === d.value, `key: "${key}": not equal`)
        }
      }
    })
  })


  describe('Should setGloalRequestInit() works', () => {
    it('change method to POST', () => {
      const method = 'POST'
      setGloalRequestInit({ method })
      const initData = getGloalRequestInit()

      assert(initData && initData.method === method)
    })

    it('change mode to no-cors', () => {
      const { mode: oriMode } = getGloalRequestInit()
      const mode = 'no-cors'
      assert(oriMode !== mode)
      setGloalRequestInit({ mode })
      const { mode: curMode } = getGloalRequestInit()

      assert(curMode === mode)
    })

    it('change timeout', () => {
      const timeout = Math.ceil(Math.random() * 100)
      setGloalRequestInit({ timeout })
      const initData = getGloalRequestInit()

      assert(initData && initData.timeout === timeout)
    })
  })

})


describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 1000))

  describe('Should handleResponseError works', () => {
    it('got status 404', resolve => {
      const url = 'https://httpbin.org/method-not-exists'

      get(url).subscribe(
        () => {
          assert(false, 'Should go into error() but not next()')
          resolve()
        },
        (err: Error) => {
          assert(
            err && err.message.indexOf(`${httpErrorMsgPrefix}404`) === 0,
            'Should got 404 error ',
          )
          resolve()
        },
      )
    })

    it('got status 405', resolve => {
      const url = 'https://httpbin.org/post'  // url for POST

      get(url).subscribe(
        () => {
          assert(false, 'Should go into error() but not next()')
          resolve()
        },
        (err: Error) => {
          assert(
            err && err.message.indexOf(`${httpErrorMsgPrefix}405`) === 0,
            'Should got 405 error ',
          )
          resolve()
        },
      )
    })
  })

})


describe(filename, () => {
  const fnName = 'buildQuery'

  describe(`Should ${fnName}() works`, () => {
    it('without data', () => {
      const url = 'https://httpbin.org/method-not-exists'
      const ret = buildQueryString(url, {})
      assert(ret === url, `Should got result "${url}", but got "${ret}" `)
    })

    it('without data', () => {
      const url = 'https://httpbin.org/method-not-exists?foo=3'
      const ret = buildQueryString(url, {})
      assert(ret === url, `Should got result "${url}", but got "${ret}" `)
    })

    it('with data', () => {
      const url = 'https://httpbin.org/method-not-exists'
      const ret = buildQueryString(url, { foo: 1 })
      const expect = url + '?foo=1'
      assert(ret === expect, `Should got result "${expect}", but got "${ret}" `)
    })

    it('with data', () => {
      const url = 'https://httpbin.org/method-not-exists?bar=2'
      const ret = buildQueryString(url, { foo: 1 })
      const expect = url + '&foo=1'
      assert(ret === expect, `Should got result "${expect}", but got "${ret}" `)
    })

    it('with data', () => {
      const url = 'https://httpbin.org/method-not-exists?bar=2'
      const ret = buildQueryString(url, { foo: 1, baz: [1, 2] })
      const expect = url + '&foo=1&baz%5B0%5D=1&baz%5B1%5D=2'
      assert(ret === expect, `Should got result "${expect}", but got "${ret}" `)
    })
  })

})


// SKIP native Fetch not support set Request cookie yet!
describe.skip(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  // const url = 'https://httpbin.org/cookies/set/foo/' + value
  const url = 'https://httpbin.org/cookies'
  const initArgs = <RxRequestInit> {
    credentials: 'include',
  }

  describe('Should works with cookies', () => {
    it('send custom cookies', resolve => {
      const args = { ...initArgs }
      const foo = Math.random()
      const bar = Math.random()
      const baz = 'a<b>c&d"e\'f'
      args.headers = {
        Cookie: `foo=${foo};bar=${bar};baz=${baz}`,
      }

      get<HttpbinRetCookie>(url, args).subscribe(
        next => {
          assert(next && next.cookies)
          assert(next.cookies.foo === foo.toString())
          assert(next.cookies.bar === bar.toString())
          assert(next.cookies.baz === baz)

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('send custom cookies', resolve => {
      const args = { ...initArgs }
      const foo = Math.random()
      const bar = Math.random()
      const baz = 'a<b>c&d"e\'f'
      args.headers = {
        Cookie: `foo=${foo}; bar=${bar}; baz=${baz}`,
      }

      get<HttpbinRetCookie>(url, args).subscribe(
        next => {
          assert(next && next.cookies)
          assert(next.cookies.foo === foo.toString())
          assert(next.cookies.bar === bar.toString())
          assert(next.cookies.baz === baz)

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


// There is a restriction to access response headers when you are using Fetch API over CORS
describe.skip(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  const url = 'https://httpbin.org/get'
  const initArgs = <RxRequestInit> {
    dataType: 'raw',
    method: 'OPTIONS',
  }

  describe('Should options works', () => {
    it('retrieve allowed options from response header', resolve => {
      const args = { ...initArgs }

      fetch<Response>(url, args).subscribe(
        res => {
          assert(res && res.headers, 'response and response.headers should not empty')
          const options = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
          const value = res.headers.get('Access-Control-Allow-Methods')
          assert(value && value === options, `Should get ${options} but got ${value}`)

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
