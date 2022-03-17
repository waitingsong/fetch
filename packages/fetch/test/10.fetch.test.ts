import assert from 'assert/strict'
import { relative } from 'path'

import { fetch, Options } from '../src/index'

import { HOST, HOST_GET } from './config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
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
    initOpts.fetchModule = void 0

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
