/// <reference types="mocha" />

import * as assert from 'power-assert'

import { fetch, RxRequestInit } from '../src/index'


const filename = '20_rxfetch.test.ts'

describe(filename, () => {

  describe('Should rxfetch() throw error with invalid input', () => {
    it('with blank string', resolve => {
      fetch('').subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
          resolve()
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

    it('with null', resolve => {
      // @ts-ignore
      fetch(null).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
          resolve()
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

    it('with undefined', resolve => {
      // @ts-ignore
      fetch().subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
          resolve()
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

  })


  describe('Should rxfetch() throw error with invalid parameter init', () => {
    const url = 'https://httpbin.org/get'
    // @ts-ignore
    const initArgs = <RxRequestInit> {
      dataType: 'text',
      fetchModule: 'should Function',
    }

    it('with invalid fetchModule', resolve => {
      const args = { ...initArgs }

      fetch(url, args).subscribe(
        () => {
          assert(false, 'Should throw error but NOT')
          resolve()
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })

  })

})

