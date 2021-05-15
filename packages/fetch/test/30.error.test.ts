/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { basename } from '@waiting/shared-core'

import {
  get,
  Options,
  FetchMsg,
  initialOptions,
} from '../src/index'

import { HOST, HOST_POST } from './config'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)


describe(filename, function() {
  this.retries(3)

  describe('Should handleResponseError work', () => {
    const opts: Options = {
      ...initialOptions,
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


