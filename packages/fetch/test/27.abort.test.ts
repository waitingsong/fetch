import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  get,
  Options,
} from '../src/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should get() work with AbortSignal', () => {
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
      const abc = new AbortController()
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
      const abc = new AbortController()
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
        assert(ex && (ex as Error).name === 'AbortError', (ex as Error).message)
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

