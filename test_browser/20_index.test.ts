/// <reference types="mocha" />

import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { get, post, Args, RxRequestInit } from '../src/index'

import { HttpbinGetResponse, HttpbinPostResponse } from '../test/model'

const filename = '20_index.test.ts'

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


  describe('Should post() works with httpbin.org', () => {
    const url = 'https://httpbin.org/post'
    const initArgs = <RxRequestInit> {
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
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const args: RxRequestInit = { ...initArgs, data: pdata, processData: false, contentType: false }

      post<HttpbinPostResponse>(url, args).subscribe(
        res => {
          assert(res && res.url === url)

          try {
            const form = res.form
            assert(form && form.p1 === p1, `Should got "${p1}"`)
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
