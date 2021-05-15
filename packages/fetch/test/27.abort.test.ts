import { basename } from '@waiting/shared-core'
import { AbortController as _AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'

import {
  get,
  Args,
  Options,
} from '../src/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, () => {

  describe('Should get() works with AbortSignal', () => {
    const url = 'https://github.com/waitingsong/rxxfetch#readme'
    const initOpts: Options = {
      url,
      method: 'GET',
      dataType: 'text',
    }

    it('with timeout', async () => {
      const opts = {
        ...initOpts,
        timeout: Math.random() * 10,
      }

      try {
        await get(url, opts)
      }
      catch (ex) {
        return
      }
      assert(false, 'Should throw timeoutError but NOT')
    })

    it('with passing abortController and timeout', async () => {
      const abc = new _AbortController() as AbortController
      const opts: Options = {
        ...initOpts,
        abortController: abc,
        timeout: Math.random() * 10,
      }

      try {
        await get(url, opts)
      }
      catch (err) {
        assert(
          !! abc.signal.aborted,
          'Should args.abortController.signal.aborted be TRUE after timeout',
        )
        return
      }
      assert(false, 'Should throw timeoutError but NOT')
    })

    it('cancel manually', async () => {
      const abc = new _AbortController() as AbortController
      const opts: Options = {
        ...initOpts,
        abortController: abc,
        timeout: 60000,
      }

      setTimeout(() => {
        abc.abort()
      }, 10)

      try {
        await get(url, opts)
      }
      catch (ex) {
        assert(ex && (ex as Error).name === 'AbortError', ex)
        assert(
          !! abc.signal.aborted,
          'Should args.abortController.signal.aborted be TRUE after timeout',
        )
        return
      }
      assert(false, 'Should got abortError in error() but go into next()')
    })
  })

})

