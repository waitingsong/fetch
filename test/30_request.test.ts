/// <reference types="mocha" />

// tslint:disable-next-line
import { abortableFetch, AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'
import { TimeoutError } from 'rxjs'

import {
  get,
  Args,
  RxRequestInit,
} from '../src/index'
import { basename } from '../src/shared/index'


const filename = basename(__filename)

describe(filename, () => {

  describe('Should get() works with AbortSignal', () => {
    const url = 'https://github.com/waitingsong/rxxfetch#readme'
    const { fetch: fetchNew } = abortableFetch(nodefetch)
    const initArgs = <RxRequestInit> {
      dataType: 'text',
      fetchModule: fetchNew,
      headersInitClass: Headers,
    }

    it('with timeout', resolve => {
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

    it('by calling abortController.abort()', resolve => {
      const args = { ...initArgs }
      const abortController = new AbortController()
      args.abortController = abortController
      args.timeout = 60000

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
        abortController.abort()
      }, 10)
    })
  })

})
