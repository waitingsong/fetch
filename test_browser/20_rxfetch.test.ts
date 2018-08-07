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


})


interface HttpbinGetResponse {
  args: any
  headers: {
    Accept: string
    Connection: string
    Host: string
    'User-Agent': string,
  }
  origin: string  // ip
  url: string
}
interface HttpbinPostResponse extends HttpbinGetResponse {
  data: string
  files: any
  form: any
  json: any
}


function ab2str(buf: ArrayBuffer) {
  const bufView = new Uint8Array(buf)
  const len = bufView.length
  const bstr = new Array(len)
  for (let i = 0; i < len; i++) {
    bstr[i] = String.fromCharCode.call(null, bufView[i])
  }
  return bstr.join('')
}
