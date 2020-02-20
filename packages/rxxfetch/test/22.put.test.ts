import { basename } from '@waiting/shared-core'
import * as FormData from 'form-data'
import * as assert from 'power-assert'

import { put, RxRequestInit, ContentTypeList } from '../src/index'

import { HttpbinPostResponse } from './model'


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 1000))

  describe('Should put() works with httpbin.org', () => {
    const url = 'https://httpbin.org/put'
    const initArgs = {
      contentType: ContentTypeList.formUrlencoded,
    } as RxRequestInit

    it('send key:value object data', (resolve) => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      put<HttpbinPostResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === url)

          try {
            const { form } = res
            assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
            assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
          }
          catch (ex) {
            assert(false, ex)
          }
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('send nested key:value object data', (resolve) => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: {
          foo: Math.random() + '',
        },
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      put<HttpbinPostResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === url)

          try {
            const { form } = res
            assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
            assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
            assert(form && form['p3[foo]'] === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
          }
          catch (ex) {
            assert(false, ex)
          }
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('send form', (resolve) => {
      const pdata = new FormData()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const args: RxRequestInit = {
        ...initArgs, data: pdata, processData: false, contentType: false,
      }

      put<HttpbinPostResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === url)

          try {
            const { form } = res
            assert(form && form.p1 === p1.toString(), `Should got "${p1}"`)
            assert(form && form.p2 === p2, `Should got "${p2}"`)
          }
          catch (ex) {
            assert(false, ex)
          }
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })
  })

})

