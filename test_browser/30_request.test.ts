/// <reference types="mocha" />

import * as assert from 'power-assert'
import { TimeoutError } from 'rxjs'

import {
  get,
  Args,
  RxRequestInit,
} from '../src/index'


const filename = '30_request.test.ts'

describe(filename, () => {

  describe('Should AbortSignal works', () => {
    const url = 'https://github.com/waitingsong/rxxfetch#readme'
    const initArgs = <RxRequestInit> {
      dataType: 'text',
    }

    it('cancel an Request of get()', resolve => {
      if (typeof AbortController !== 'function') {
        resolve()
        return
      }

      const args = { ...initArgs }
      args.abortController = new AbortController()
      args.timeout = Math.random() * 10

      get(url, args).subscribe(
        () => {
          assert(false, 'Should throw timeoutError but NOT')
          resolve()
        },
        err => {
          assert(err && err instanceof TimeoutError, err)
          assert(
            (<NonNullable<Args['abortController']>> args.abortController).signal.aborted,
            'Should args.abortController.signal.aborted be TRUE after timeout',
          )
          resolve()
        },
      )
    })
  })

})
