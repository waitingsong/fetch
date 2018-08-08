/// <reference types="mocha" />

import * as FormData from 'form-data'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'
import * as QueryString from 'qs'

import fetch, { Args, RxRequestInit } from '../src/index'
import {
  basename,
} from '../src/shared/index'


const filename = basename(__filename)

describe(filename, () => {

  describe('Should rxfetch() throw error with invalid input', () => {
    const initArgs = <RxRequestInit> {
      dataType: 'text',
      fetchModule: nodefetch,
      fetchHeadersClass: Headers,
      timeout: 20 * 1000,
    }

    it('with blank string', resolve => {
      const args = { ...initArgs }

      fetch('', args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
        resolve,
      )
    })

    it('with null', resolve => {
      const args = { ...initArgs }

      // @ts-ignore
      fetch(null, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
        resolve,
      )
    })

    it('with undefined', resolve => {
      const args = { ...initArgs }

      // @ts-ignore
      fetch(undefined, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
        resolve,
      )
    })

  })

})
