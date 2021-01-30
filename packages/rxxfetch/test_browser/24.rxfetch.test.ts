import { fetch, RxRequestInit } from '../src/index'

import { HOST, HOST_GET } from './config'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = '20_rxfetch.test.ts'

describe(filename, () => {
  describe('Should rxfetch() throw error with invalid input', () => {
    it('with blank string', (resolve) => {
      fetch('').subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

    it('with null', (resolve) => {
      // @ts-ignore
      fetch(null).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

    it('with undefined', (resolve) => {
      // @ts-ignore
      fetch().subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

  })


  describe('Should rxfetch() throw error with invalid parameter init', () => {
    const url = HOST_GET
    // @ts-ignore
    const initArgs = {
      dataType: 'text',
      fetchModule: 'should Function',
    } as RxRequestInit

    it('with invalid fetchModule', (resolve) => {
      const args = { ...initArgs }

      fetch(url, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })
  })

})
