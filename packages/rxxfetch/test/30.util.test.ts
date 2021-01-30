/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { basename } from '@waiting/shared-core'
import { abortableFetch, AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import nodefetch, { Headers as nodeHeaders } from 'node-fetch'

import { Args, ArgsRequestInitCombined, RxRequestInit, ContentTypeList } from '../src/index'
import { initialRxRequestInit } from '../src/lib/config'
import { selectFecthModule } from '../src/lib/util'


// eslint-disable-next-line import/order
import rewire = require('rewire')
// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)
const mods = rewire('../src/lib/util')

describe(filename, () => {

  const fnName = 'parseTimeout'
  const fn = mods.__get__(fnName)

  describe(`Should ${fnName}() works`, () => {
    it('with param zero', () => {
      const ret = fn(0)
      assert(ret === 0, `Should got result zero, but got "${ret}" `)
    })

    it('with param positive integer', () => {
      const values = [1, 99, 1000, Math.ceil(Math.random() * 100)]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === value, `Should got result "${value}, but got "${ret}" `)
      }
    })

    it('with param positive float', () => {
      const values = [1.2, 99.0, 1000.123, Math.random() * 100]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === Math.ceil(value), `Should got result "${Math.ceil(value)}, but got "${ret}" `)
      }
    })

    it('with param negative number', () => {
      const values = [-1, -99, -1.2, -1000.123, -(Math.random() * 100)]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === null, `Should got result NULL, but got "${ret}" `)
      }
    })

    it('with param none number', () => {
      const values = ['', '_', '-1', '-1.2', '1', '1000', 'a', '1a', 'a1', '0x8', true, false, null]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === null, `Should got result NULL, but got "${ret}" `)
      }
    })
  })

})


describe(filename, () => {
  const fnName = 'parseDataType'
  const fn = mods.__get__(fnName)

  describe(`Should ${fnName}() works`, () => {
    it('with blank', () => {
      const ret = fn('')
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)
    })

    it('with invalid value', () => {
      let ret = fn('fake')
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)

      ret = fn(null)
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)

      ret = fn(0)
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)
    })

    it('with valid string', () => {
      const ret = fn('raw')
      assert(ret === 'raw', `Should got result "json", but got "${ret}" `)
    })
  })

})


describe(filename, () => {
  const fnName = 'parseHeaders'
  const fn = mods.__get__(fnName)
  const initArgs = { ...initialRxRequestInit }

  describe(`Should ${fnName}() works`, () => {
    it('pass headers instance', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random().toString()
      const headers = new nodeHeaders()
      headers.set('Cookie', value)

      // @ts-ignore
      const combined = {
        args,
        requestInit: {
          headers,
        },
      } as ArgsRequestInitCombined
      const ret = fn(combined)
      const retHeaders = ret.requestInit.headers as Headers
      assert(retHeaders && retHeaders.get('Cookie') === value)
    })

    it('pass headers key:value object', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random().toString()
      const headers = {
        Cookie: value,
      }

      // @ts-ignore
      const combined = {
        args,
        requestInit: {
          headers,
        },
      } as ArgsRequestInitCombined
      const ret = fn(combined)
      const retHeaders = ret.requestInit.headers as Headers
      assert(retHeaders && retHeaders.get('Cookie') === value)
    })

    it('throw TypeError without passing HeadersClass', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random().toString()
      const headers = new nodeHeaders()
      headers.set('Cookie', value)

      args.headersInitClass = null

      // @ts-ignore
      const combined = {
        args,
        requestInit: {
          headers,
        },
      } as ArgsRequestInitCombined
      try {
        fn(combined)
        assert(false, 'Should throw Error, but not')
      }
      catch (ex) {
        assert(ex instanceof TypeError, 'Should throw TypeError, but got Error')
      }
    })
  })

})


describe(filename, () => {
  const fnName = 'parseCookies'
  const fn = mods.__get__(fnName)
  const initArgs = { ...initialRxRequestInit }

  describe(`Should ${fnName}() works`, () => {
    it('with valid data', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random().toString()
      const headers = new nodeHeaders()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      const cookies = { p1, p2 }

      headers.set('Cookie', value)
      args.cookies = cookies
      // @ts-ignore
      const combined = {
        args,
        requestInit: { headers },
      } as ArgsRequestInitCombined
      const ret = fn(combined)
      const retHeaders = ret.requestInit.headers as Headers

      assert(retHeaders && retHeaders.get('Cookie') === `${value}; p1=${p1}; p2=${p2}`)
    })

    it('with partial valid data', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random().toString()
      const headers = new nodeHeaders()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      const cookies = {
        p1,
        p2,
        ' ': 'foo',
        [Symbol.for('foo')]: 'bar',
      }

      headers.set('Cookie', value)
      args.cookies = cookies
      // @ts-ignore
      const combined = {
        args,
        requestInit: { headers },
      } as ArgsRequestInitCombined
      const ret = fn(combined)
      const retHeaders = ret.requestInit.headers as Headers

      assert(retHeaders && retHeaders.get('Cookie') === `${value}; p1=${p1}; p2=${p2}`)
    })

    it('with enumerable Symbol key', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random().toString()
      const headers = new nodeHeaders()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      const p3 = Math.random().toString()
      const cookies = {
        p1,
        p2,
        ' ': 'foo',
        [Symbol.for('foo')]: 'bar',
      }

      Object.defineProperty(cookies, 'bar', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: p3,
      })

      headers.set('Cookie', value)
      args.cookies = cookies
      // @ts-ignore
      const combined = {
        args,
        requestInit: { headers },
      } as ArgsRequestInitCombined
      const ret = fn(combined)
      const retHeaders = ret.requestInit.headers as Headers

      assert(retHeaders && retHeaders.get('Cookie') === `${value}; p1=${p1}; p2=${p2}; bar=${p3}`)
    })
  })

})


describe(filename, () => {
  const fnName = 'parseAbortController'
  const fn = mods.__get__(fnName)
  const initArgs = { ...initialRxRequestInit }

  describe(`Should ${fnName}() works`, () => {
    it('with passing AbortController', () => {
      const args = { ...initArgs }
      args.abortController = new AbortController()
      // @ts-ignore
      const combined = {
        args,
        requestInit: {},
      } as ArgsRequestInitCombined
      // @ts-ignore
      const ret = fn(combined)
      const { args: args2, requestInit: init2 } = ret

      assert(args2.abortController && typeof args2.abortController.abort === 'function' && init2.signal)
      // @ts-ignore
      assert(typeof init2.signal === 'object' && args2.abortController.signal === init2.signal)
      // @ts-ignore
      delete global.AbortController
    })

    it('with global AbortController', () => {
      const args = { ...initArgs }
      // @ts-ignore
      const combined = {
        args,
        requestInit: {},
      } as ArgsRequestInitCombined
      // @ts-ignore
      global.AbortController = AbortController
      const ret = fn(combined)
      const { args: args2, requestInit: init2 } = ret

      assert(args2.abortController && typeof args2.abortController.abort === 'function' && init2.signal)
      // @ts-ignore
      assert(typeof init2.signal === 'object' && args2.abortController.signal === init2.signal)
      // @ts-ignore
      delete global.AbortController
    })
  })

})


describe(filename, () => {
  const fnName = 'parseMethod'
  const fn = mods.__get__(fnName)
  const initArgs = {} as RxRequestInit

  describe(`Should ${fnName}() works without method`, () => {
    it('with contentType:false', () => {
      const args = { ...initArgs }
      args.contentType = false
      // @ts-ignore
      const combined = {
        args,
        requestInit: {},
      } as ArgsRequestInitCombined
      // @ts-ignore
      const ret = fn(combined)
      const headers = ret.requestInit.headers as Headers

      assert(! headers)

    })
  })

  describe(`Should ${fnName}() works with method:POST`, () => {
    it('with contentType:false', () => {
      const args = { ...initArgs }
      args.contentType = false
      const headers = new nodeHeaders()
      // @ts-ignore
      const combined = {
        args,
        requestInit: { method: 'POST', headers },
      } as ArgsRequestInitCombined

      // @ts-ignore
      const ret = fn(combined)
      const headersRet = ret.requestInit.headers as Headers

      assert(headersRet && ! headersRet.get('Content-Type'))
    })

    it('with contentType', () => {
      const args = { ...initArgs }
      args.contentType = Math.random().toString()
      const headers = new nodeHeaders()
      // @ts-ignore
      const combined = {
        args,
        requestInit: { method: 'POST', headers },
      } as ArgsRequestInitCombined

      // @ts-ignore
      const ret = fn(combined)
      const headersRet = ret.requestInit.headers as Headers

      assert(headersRet && headersRet.get('Content-Type') === args.contentType)
    })

    it('default contentType "application/x-www-form-urlencoded"', () => {
      const args = { ...initArgs }
      const headers = new nodeHeaders()
      // @ts-ignore
      const combined = {
        args,
        requestInit: { method: 'POST', headers },
      } as ArgsRequestInitCombined

      // @ts-ignore
      const ret = fn(combined)
      const headersRet = ret.requestInit.headers as Headers
      const defaults = ContentTypeList.json

      assert(headersRet && headersRet.get('Content-Type') === defaults)
    })
  })

})


describe(filename, () => {
  const fnName = 'selectFecthModule'

  describe(`Should ${fnName}() works`, () => {
    it('without parameter', () => {
      try {
        selectFecthModule(null)
        assert(false, 'Should get error but NOT')
      }
      catch (ex) {
        assert(true)
      }
    })

    it('with invalid parameter', () => {
      try {
        // @ts-ignore
        selectFecthModule('foo')
        assert(false, 'Should get error but NOT')
      }
      catch (ex) {
        assert(true)
      }
    })

    it('with valid parameter', () => {
      // @ts-ignore
      const ret = selectFecthModule(nodefetch)
      assert(ret === nodefetch)
    })

    it('with global parameter', () => {
      // @ts-ignore
      global.fetch = nodefetch
      const ret = selectFecthModule(null)
      assert(ret === nodefetch)
    })
  })

})


describe(filename, () => {
  const fnName = 'parseRedirect'
  const fn = mods.__get__(fnName)

  describe(`Should ${fnName}() works with keepRedirectCookies:true`, () => {
    it('expect "follow" to "manual"', () => {
      const keepRedirectCookies = true
      const curValue: RequestInit['redirect'] = 'follow'
      const ret = fn(keepRedirectCookies, curValue)

      assert(ret === 'manual')
    })

    it('expect "error" not changed', () => {
      const keepRedirectCookies = true
      const curValue: RequestInit['redirect'] = 'error'
      const ret = fn(keepRedirectCookies, curValue)

      assert(ret === curValue)
    })

    it('expect "follow" not changed under Browser (mocked on Node.js)', () => {
      const keepRedirectCookies = true
      const curValue: RequestInit['redirect'] = 'follow'
      // @ts-ignore
      global.window = true
      const ret = fn(keepRedirectCookies, curValue)

      assert(ret === curValue)
      // @ts-ignore
      delete global.window
    })

    it('expect "error" not changed under Browser (mocked on Node.js)', () => {
      const keepRedirectCookies = true
      const curValue: RequestInit['redirect'] = 'error'
      // @ts-ignore
      global.window = true
      const ret = fn(keepRedirectCookies, curValue)

      assert(ret === curValue)
      // @ts-ignore
      delete global.window
    })
  })

  describe(`Should ${fnName}() works with keepRedirectCookies:false`, () => {
    it('expect passed value', () => {
      const keepRedirectCookies = false

      let curValue: RequestInit['redirect'] = 'error'
      let ret = fn(keepRedirectCookies, curValue)
      assert(ret === curValue)

      curValue = 'manual'
      ret = fn(keepRedirectCookies, curValue)
      assert(ret === curValue)

      curValue = 'follow'
      ret = fn(keepRedirectCookies, curValue)
      assert(ret === curValue)
    })

    it('expect default value "follow"', () => {
      const keepRedirectCookies = false

      // @ts-ignore
      let ret = fn(keepRedirectCookies, '')
      assert(ret === 'follow')

      // @ts-ignore
      ret = fn(keepRedirectCookies, null)
      assert(ret === 'follow')
    })
  })

})

