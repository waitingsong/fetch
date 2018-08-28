/// <reference types="mocha" />

// tslint:disable-next-line
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'

import {
  buildQueryString,
  fetch,
  get,
  getGloalRequestInit,
  setGloalRequestInit,
  RxRequestInit,
} from '../src/index'
import { httpErrorMsgPrefix, initialRxRequestInit } from '../src/lib/config'
import { basename } from '../src/shared/index'

import { HttpbinRetCookie } from './model'


const filename = basename(__filename)
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

  describe('Should handleResponseError works', () => {
    const initArgs = <RxRequestInit> {
      dataType: 'text',
      fetchModule: nodefetch,
      headersInitClass: Headers,
    }

    it('got status 404', resolve => {
      const url = 'https://httpbin.org/method-not-exists'
      const args = { ...initArgs }

      get(url, args).subscribe(
        () => {
          assert(false, 'Should go into error() not next()')
          resolve()
        },
        (err: Error) => {
          assert(
            err && err.message.indexOf(`${httpErrorMsgPrefix}404`) === 0,
            'Should got 404 error, but got: ' + err.message,
          )
          resolve()
        },
      )
    })

    it('got status 405', resolve => {
      const url = 'https://httpbin.org/post'  // url for POST
      const args = { ...initArgs }

      get(url, args).subscribe(
        () => {
          assert(false, 'Should go into error() but not next()')
          resolve()
        },
        (err: Error) => {
          assert(
            err && err.message.indexOf(`${httpErrorMsgPrefix}405`) === 0,
            `Should get 405 error but get ${err.message}`,
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


describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 1000))

  // const url = 'https://httpbin.org/cookies/set/foo/' + value
  const url = 'https://httpbin.org/cookies'
  const initArgs = <RxRequestInit> {
    fetchModule: nodefetch,
    headersInitClass: Headers,
    credentials: 'include',
  }

  describe('Should works with cookies', () => {
    it('cookies pass by args.cookies', resolve => {
      const args = { ...initArgs }
      const foo = Math.random()
      const bar = Math.random()
      const baz = 'a<b>c&d"e\'f'

      args.cookies = { foo, bar, baz }

      get<HttpbinRetCookie>(url, args).subscribe(
        next => {
          try {
            assert(next && next.cookies)
            assert(next.cookies.foo === foo.toString())
            assert(next.cookies.bar === bar.toString())
            assert(next.cookies.baz === baz)
          }
          catch (ex) {
            assert(false, ex)
          }

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('custom cookies pass by args.headers', resolve => {
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
          assert(next.cookies.baz === baz.toString())

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('custom cookies pass by args.headers', resolve => {
      const args = { ...initArgs }
      const fvalue = Math.random()
      const bvalue = Math.random()
      const zvalue = 'a<b>c&d"e\'f'
      args.headers = {
        Cookie: `foo=${fvalue}; bar=${bvalue}; baz=${zvalue}`,
      }

      get<HttpbinRetCookie>(url, args).subscribe(
        next => {
          assert(next && next.cookies)
          assert(next.cookies.foo === fvalue.toString())
          assert(next.cookies.bar === bvalue.toString())
          assert(next.cookies.baz === zvalue.toString())

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('cookies pass by both args.cookies and args.headers', resolve => {
      const args = { ...initArgs }
      const foo = Math.random()
      const bar = Math.random()
      const baz = 'a<b>c&d"e\'f'

      args.cookies = { foo, bar, baz }
      args.headers = {
        Cookie: `foo2=${foo};bar2=${bar};baz2=${baz}`,
      }

      get<HttpbinRetCookie>(url, args).subscribe(
        next => {
          assert(next && next.cookies)
          assert(next.cookies.foo === foo.toString())
          assert(next.cookies.bar === bar.toString())
          assert(next.cookies.baz === baz)
          assert(next.cookies.foo2 === foo.toString())
          assert(next.cookies.bar2 === bar.toString())
          assert(next.cookies.baz2 === baz)

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


describe(filename, function() {
  this.retries(3)

  const url = 'https://httpbin.org/get'
  const initArgs = <RxRequestInit> {
    dataType: 'raw',
    fetchModule: nodefetch,
    headersInitClass: Headers,
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
