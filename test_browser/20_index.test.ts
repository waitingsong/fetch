/// <reference types="mocha" />

import * as assert from 'power-assert'
import { TimeoutError } from 'rxjs'

import { get, getGloalRequestInit, setGloalRequestInit, RxRequestInit } from '../src/index'
import { httpErrorMsgPrefix, initialRxRequestInit } from '../src/lib/config'


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


  describe('Should get() works with AbortSignal', () => {
    const url = 'https://github.com/waitingsong/rxxfetch#readme'
    const initArgs = <RxRequestInit> {
      dataType: 'text',
    }

    it('with timeout', resolve => {
      if (typeof AbortController !== 'function') {
        resolve()
        return
      }

      const args = { ...initArgs }
      args.timeout = 1

      get(url, args).subscribe(
        () => {
          assert(false, 'Should throw timeoutError but NOT')
          resolve()
        },
        err => {
          assert(err && err instanceof TimeoutError, err)
          resolve()
        },
      )
    })

    it('by calling abortController.abort()', resolve => {
      if (typeof AbortController !== 'function') {
        resolve()
        return
      }

      const args = { ...initArgs }
      const abortController = new AbortController()
      args.abortController = abortController
      args.timeout = 30000

      get(url, args).subscribe(
        next => {
          assert(false, 'Should got abortError in error() but go into next()')
          resolve()
        },
        err => {
          assert(err && err.name === 'AbortError', err)
          resolve()
        },
      )
      setTimeout(() => {
        abortController.abort()
      }, 1)
    })
  })

})
