/// <reference types="mocha" />

import * as assert from 'power-assert'
import * as QueryString from 'qs'

import fetch, { Args, RxRequestInit } from '../src/index'


const filename = '20_get.test.ts'

describe(filename, () => {

  describe('Should rxfetch() throw error with invalid input', () => {
    it('with blank string', resolve => {
      fetch('').subscribe(
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
      // @ts-ignore
      fetch(null).subscribe(
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
      // @ts-ignore
      fetch().subscribe(
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

