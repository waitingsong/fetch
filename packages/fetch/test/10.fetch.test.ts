import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { fetch, Options } from '../src/index.js'

import { HOST, HOST_GET } from './config.js'


describe(fileShortPath(import.meta.url), () => {
  describe('Should fetch() throw error with invalid input', () => {
    const initOpts: Options = {
      url: '',
      method: 'GET',
      dataType: 'text',
    }

    it('with blank url', async () => {
      const opts = { ...initOpts }

      try {
        await fetch(opts)
      }
      catch (ex) {
        return
      }
      assert(false, 'Should throw error but NOT')
    })
  })

})
