/* eslint-disable @typescript-eslint/restrict-template-expressions */
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  get,
  Options,
  FetchMsg,
} from '../src/index.js'

import { HOST, HOST_POST } from './config.js'


describe(fileShortPath(import.meta.url), function() {
  this.retries(3)

  describe('Should handleResponseError work', () => {
    const opts: Partial<Options > = {
      dataType: 'text',
    }

    it('got status 404', async () => {
      const url = HOST + '/method-not-exists'
      const args = { ...opts }

      try {
        await get(url, args)
      }
      catch (ex) {
        const err = ex as Error
        assert(
          err && err.message.startsWith(`${FetchMsg.httpErrorMsgPrefix}404`),
          'Should got 404 error, but got: ' + err.message,
        )
        return
      }
      assert(false, 'Should throw error but not')
    })

    it('got status 405', async () => {
      const url = HOST_POST // url for POST
      const args = { ...opts }

      try {
        await get(url, args)
      }
      catch (ex) {
        const err = ex as Error
        assert(
          err && err.message.startsWith(`${FetchMsg.httpErrorMsgPrefix}405`),
          `Should get 405 error but get ${err.message}`,
        )
        return
      }
      assert(false, 'Should throw error but not')
    })
  })

})


