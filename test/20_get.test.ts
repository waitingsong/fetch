/// <reference types="mocha" />

import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { get, RxRequestInit } from '../src/index'
import {
  basename,
} from '../src/shared/index'

import { HttpbinGetResponse, PDATA } from './model'
import { ab2str } from './util'


const filename = basename(__filename)

describe(filename, () => {

  describe('Should get() works with github.com', () => {
    const url = 'https://github.com/waitingsong/rxxfetch#readme'
    const regexp = /<title>[\w -]+?waitingsong\/rxxfetch/
    const initArgs = <RxRequestInit> {
      dataType: 'text',
      fetchModule: nodefetch,
      fetchHeadersClass: Headers,
      // mode: 'cors',
      timeout: 20 * 1000,
    }

    it('fetch page', resolve => {
      const args = { ...initArgs }

      get<string>(url, args).subscribe(
        txt => {
          assert(txt && regexp.test(txt.slice(500, 3000)))
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('with dataType: arrayBuffer', resolve => {
      const args = { ...initArgs }
      args.dataType = 'arrayBuffer'

      get<ArrayBuffer>(url, args).subscribe(
        buf => {
          const txt = buf.byteLength ? ab2str(buf.slice(0, 5000)) : ''
          assert(txt && regexp.test(txt.slice(500, 3000)))
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('with timeout', resolve => {
      const args = { ...initArgs }
      args.timeout = 1

      get(url, args).subscribe(
        () => {
          assert(false, 'Should throw timeoutError but NOT')
          resolve()
        },
        () => {
          assert(true)
          resolve()
        },
      )
    })
  })


  describe('Should get() works with httpbin.org', () => {
    const url = 'https://httpbin.org/get'
    const initData: PDATA = {
      p1: Math.random(),
      p2: Math.random().toString(),
    }
    const initArgs = <RxRequestInit> {
      fetchModule: nodefetch,
      fetchHeadersClass: Headers,
      timeout: 20 * 1000,
      dataType: 'json',
    }

    it('without query data', resolve => {
      const args = { ...initArgs }

      get<HttpbinGetResponse>(url, args).subscribe(
        res => {
          // console.info(res)
          assert(!! res, 'Should response not empty')
          assert(res.url === url)
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
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
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
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
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

  })

})
