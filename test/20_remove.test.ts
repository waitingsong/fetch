/// <reference types="mocha" />

import * as FormData from 'form-data'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { remove, RxRequestInit } from '../src/index'
import { basename } from '../src/shared/index'
import { HttpbinPostResponse, PDATA } from '../test/model'

const filename = basename(__filename)

describe(filename, () => {

  describe('Should remove() works with httpbin.org', () => {
    const url = 'https://httpbin.org/delete'
    const initArgs = <RxRequestInit> {
      fetchModule: nodefetch,
      headersInitClass: Headers,
    }

    it('send key:value object data', resolve => {
      const pdata: PDATA = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      remove<HttpbinPostResponse>(url, args).subscribe(
        res => {
          try {
            assert(res && res.args, 'Should response.args not empty')
            assert(res.url === url + '?' + QueryString.stringify(pdata))
            assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
            assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
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

    it('send nested key:value object data', resolve => {
      const pdata: PDATA = {
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: {
          foo: Math.random() + '',
        },
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      remove<HttpbinPostResponse>(url, args).subscribe(
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

    it('send form', resolve => {
      const pdata = new FormData()
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const args: RxRequestInit = { ...initArgs, data: pdata, processData: false, contentType: false }

      remove<HttpbinPostResponse>(url, args).subscribe(
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
