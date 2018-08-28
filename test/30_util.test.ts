/// <reference types="mocha" />

// tslint:disable-next-line
import { abortableFetch, AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import nodefetch, { Headers as nodeHeaders } from 'node-fetch'
import * as assert from 'power-assert'
import rewire = require('rewire')

import {
  Args, ArgsRequestInitCombined, RxRequestInit,
} from '../src/index'
import { initialRxRequestInit } from '../src/lib/config'
import { basename } from '../src/shared/index'


const filename = basename(__filename)
const mods = rewire('../src/lib/util')

describe(filename, () => {

  const fnName = 'parseTimeout'
  const fn = <(p: any) => number | null> mods.__get__(fnName)

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
      const values = [1.2, 99.0, 1000.123, (Math.random() * 100)]

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
  const fn = <(value: any) => NonNullable<Args['dataType']>> mods.__get__(fnName)

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
  const fn = <(options: ArgsRequestInitCombined) => ArgsRequestInitCombined> mods.__get__(fnName)
  const initArgs = <RxRequestInit> {
    fetchModule: nodefetch,
    headersInitClass: nodeHeaders,
  }

  describe(`Should ${fnName}() works`, () => {
    it('pass headers instance', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random()
      const headers = new nodeHeaders()
      headers.set('Cookie', value)

      // @ts-ignore
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: {
          headers,
        },
      }
      const ret = fn(combined)
      const retHeaders = <Headers> ret.requestInit.headers
      assert(retHeaders && retHeaders.get('Cookie') === value)
    })

    it('pass headers key:value object', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random()
      const headers = {
        Cookie: value,
      }

      // @ts-ignore
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: {
          headers,
        },
      }
      const ret = fn(combined)
      const retHeaders = <Headers> ret.requestInit.headers
      assert(retHeaders && retHeaders.get('Cookie') === value)
    })
  })

})


describe(filename, () => {
  const fnName = 'parseCookies'
  const fn = <(options: ArgsRequestInitCombined) => ArgsRequestInitCombined> mods.__get__(fnName)
  const initArgs = <RxRequestInit> {
    fetchModule: nodefetch,
    headersInitClass: nodeHeaders,
  }

  describe(`Should ${fnName}() works`, () => {
    it('with valid data', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random()
      const headers = new nodeHeaders()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      const cookies = { p1, p2 }

      headers.set('Cookie', value)
      args.cookies = cookies
      // @ts-ignore
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: { headers },
      }
      const ret = fn(combined)
      const retHeaders = <Headers> ret.requestInit.headers

      assert(retHeaders && retHeaders.get('Cookie') === `${value}; p1=${p1}; p2=${p2}`)
    })

    it('with partial valid data', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random()
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
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: { headers },
      }
      const ret = fn(combined)
      const retHeaders = <Headers> ret.requestInit.headers

      assert(retHeaders && retHeaders.get('Cookie') === `${value}; p1=${p1}; p2=${p2}`)
    })

    it('with enumerable Symbol key', () => {
      const args = { ...initArgs }
      const value = 'foo=' + Math.random()
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
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: { headers },
      }
      const ret = fn(combined)
      const retHeaders = <Headers> ret.requestInit.headers

      assert(retHeaders && retHeaders.get('Cookie') === `${value}; p1=${p1}; p2=${p2}; bar=${p3}`)
    })
  })

})


describe(filename, () => {
  const fnName = 'parseAbortController'
  const fn = <(options: ArgsRequestInitCombined) => ArgsRequestInitCombined> mods.__get__(fnName)
  const initArgs = <RxRequestInit> { }

  describe(`Should ${fnName}() works`, () => {
    it('with AbortController', () => {
      const args = { ...initArgs }
      args.abortController = new AbortController()
      // @ts-ignore
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: {},
      }
      // @ts-ignore
      const ret = fn(combined)
      const { args: args2, requestInit: init2 } = ret

      assert(args2.abortController && typeof args2.abortController.abort === 'function' && init2.signal)
      // @ts-ignore
      assert(typeof init2.signal === 'object' && args2.abortController.signal === init2.signal)
      // @ts-ignore
      delete global.AbortController
    })

    it('without AbortController', () => {
      const args = { ...initArgs }
      // @ts-ignore
      const combined = <ArgsRequestInitCombined> {
        args,
        requestInit: {},
      }
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
