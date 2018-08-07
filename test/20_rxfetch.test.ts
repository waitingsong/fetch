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
