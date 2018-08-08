/// <reference types="mocha" />

import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { get, RxRequestInit } from '../src/index'
import { HttpbinGetResponse, PDATA } from '../test/model'


const filename = '20_get.test.ts'

describe(filename, () => {

  describe('Should get() works with httpbin.org', () => {
    const url = 'https://httpbin.org/get'
    const initData: PDATA = {
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
      const pdata = { ...initData }
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

    it('send nested key:value object data', resolve => {
      const pdata: PDATA = { ...initData }
      pdata.p3 = {
        foo: Math.random() + '',
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      get<HttpbinGetResponse>(url, args).subscribe(
        res => {
          const sendUrl = decodeURI(url + '?' + QueryString.stringify(pdata))

          try {
            assert(res && res.args, 'Should response.args not empty')
            assert(res.url === sendUrl, `Should get ${sendUrl}, but got ${res.url}`)
            assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
            assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
            assert(pdata.p3 && res.args['p3[foo]'] === pdata.p3.foo, `Should got ${pdata!.p3!.foo}`)
          }
          catch (ex) {
            assert(false, ex)
          }
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
