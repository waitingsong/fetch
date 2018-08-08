/// <reference types="mocha" />

import * as FormData from 'form-data'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { get, post, Args, RxRequestInit } from '../src/index'
import {
  basename,
} from '../src/shared/index'

import { HttpbinGetResponse, HttpbinPostResponse } from './model'


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
        },
        err => {
          assert(false, err)
          resolve()
        },
        resolve,
      )
    })

    it('with dataType: arrayBuffer', resolve => {
      const args = { ...initArgs }
      args.dataType = 'arrayBuffer'

      get<ArrayBuffer>(url, args).subscribe(
        buf => {
          const txt = buf.byteLength ? ab2str(buf.slice(0, 5000)) : ''
          assert(txt && regexp.test(txt.slice(500, 3000)))
        },
        err => {
          assert(false, err)
          resolve()
        },
        resolve,
      )
    })

    it('with timeout', resolve => {
      const args = { ...initArgs }
      args.timeout = 1

      get(url, args).subscribe(
        () => {
          assert(false, 'Should throw timeoutError but NOT')
        },
        () => {
          assert(true)
          resolve()
        },
        resolve,
      )
    })
  })


  describe('Should get() works with httpbin.org', () => {
    const url = 'https://httpbin.org/get'
    const pdata = {
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


  describe('Should post() works with httpbin.org', () => {
    const url = 'https://httpbin.org/post'
    const initArgs = <RxRequestInit> {
      fetchModule: nodefetch,
      fetchHeadersClass: Headers,
      timeout: 20 * 1000,
    }

    it('send key:value object data', resolve => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      post<HttpbinPostResponse>(url, args).subscribe(
        res => {
          assert(res && res.url === url)

          try {
            const form = res.form
            assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
            assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
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

    it('send nested key:value object data', resolve => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: {
          foo: Math.random() + '',
        },
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      post<HttpbinPostResponse>(url, args).subscribe(
        res => {
          assert(res && res.url === url)

          try {
            const form = res.form
            assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
            assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
            assert(form && form['p3[foo]'] === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
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

    it('send form', resolve => {
      const pdata = new FormData()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const args: RxRequestInit = { ...initArgs, data: pdata, processData: false, contentType: false }

      post<HttpbinPostResponse>(url, args).subscribe(
        res => {
          assert(res && res.url === url)

          try {
            const form = res.form
            assert(form && form.p1 === p1.toString(), `Should got "${p1}"`)
            assert(form && form.p2 === p2, `Should got "${p2}"`)
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



function ab2str(buf: ArrayBuffer) {
  const bufView = new Uint8Array(buf)
  const len = bufView.length
  const bstr = new Array(len)
  for (let i = 0; i < len; i++) {
    bstr[i] = String.fromCharCode.call(null, bufView[i])
  }
  return bstr.join('')
}
