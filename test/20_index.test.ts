/// <reference types="mocha" />

import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'

import { get, getGloalRequestInit, put, setGloalRequestInit, RxRequestInit } from '../src/index'
import { httpErrorMsgPrefix, initialRxRequestInit } from '../src/lib/config'
import { basename } from '../src/shared/index'

import { PDATA } from './model'


const filename = basename(__filename)
const defaultInit = getGloalRequestInit()

describe(filename, () => {
  after(() => {
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


  describe('Should handleResponseError works', () => {
    const initArgs = <RxRequestInit> {
      dataType: 'text',
      fetchModule: nodefetch,
      fetchHeadersClass: Headers,
      timeout: 20 * 1000,
    }

    it('got status 404', resolve => {
      const url = 'https://httpbin.org/method-not-exists'
      const args = { ...initArgs }

      get(url, args).subscribe(
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
      const args = { ...initArgs }

      get(url, args).subscribe(
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
