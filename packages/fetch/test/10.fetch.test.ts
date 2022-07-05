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


  describe('Should fetch() throw error with invalid parameter init', () => {
    const url = HOST_GET
    const initOpts: Options = {
      url,
      method: 'GET',
      dataType: 'text',
    }
    // initOpts.fetchModule = void 0

    it('with invalid fetchModule', async () => {
      const opts = { ...initOpts }
      // @ts-ignore
      opts.fetchModule = 'should Function'

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
