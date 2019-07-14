/// <reference types="mocha" />

import { basename } from '@waiting/shared-core'
// tslint:disable-next-line
import { AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import * as assert from 'power-assert'
import { TimeoutError } from 'rxjs'

import {
  get,
  Args,
  RxRequestInit,
} from '../src/index'


const filename = basename(__filename)

describe(filename, () => {

  describe('Should get() works with AbortSignal', () => {
    const url = 'https://github.com/waitingsong/rxxfetch#readme'
    const initArgs = <RxRequestInit> {
      dataType: 'text',
    }

    it('with timeout', resolve => {
      const args = {
        ...initArgs,
        timeout: Math.random() * 10,
      }

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

    it('with passing abortController and timeout', resolve => {
      const args = {
        ...initArgs,
        abortController: new AbortController(),
        timeout: Math.random() * 10,
      }

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

    it('cancel manually', resolve => {
      const args = {
        ...initArgs,
        abortController: new AbortController(),
        timeout: 60000,
      }

      get(url, args).subscribe(
        next => {
          assert(false, 'Should got abortError in error() but go into next()')
          resolve()
        },
        err => {
          assert(err && err.name === 'AbortError', err)
          assert(
            (<NonNullable<Args['abortController']>> args.abortController).signal.aborted,
            'Should args.abortController.signal.aborted be TRUE after timeout',
          )
          resolve()
        },
      )
      setTimeout(() => {
        args.abortController.abort()
      }, 10)
    })
  })

})
