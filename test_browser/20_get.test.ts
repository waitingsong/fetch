/// <reference types="mocha" />

import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { get, RxRequestInit } from '../src/index'
import { HttpbinGetResponse } from '../test/model'


const filename = '20_get.test.ts'

describe(filename, () => {

  describe('Should get() works with httpbin.org', () => {
    const url = 'https://httpbin.org/get'
    const pdata = {
      p1: Math.random(),
      p2: Math.random().toString(),
    }
    const initArgs = <RxRequestInit> {
      timeout: 20 * 1000,
      dataType: 'json',
    }

    it('without args', resolve => {
      get<HttpbinGetResponse>(url).subscribe(
        res => {
          assert(!! res, 'Should response not empty')
          assert(res.url === url)
        },
        err => {
          assert(false, err)
          resolve()
        },
        resolve,
      )
    })

    it('without query data', resolve => {
      const args = { ...initArgs }

      get<HttpbinGetResponse>(url, args).subscribe(
        res => {
          assert(!! res, 'Should response not empty')
          assert(res.url === url)
        },
        err => {
          assert(false, err)
          resolve()
        },
        resolve,
      )
    })

    it('with query data', resolve => {
      const args = { ...initArgs }
      args.data = pdata

      get<HttpbinGetResponse>(url, args).subscribe(
        res => {
          // console.info(res)
          assert(res && res.args, 'Should response.args not empty')
          assert(res.url === url + '?' + QueryString.stringify(pdata))
          assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
          assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
        },
        err => {
          assert(false, err)
          resolve()
        },
        resolve,
      )
    })

  })

})
