import { basename } from '@waiting/shared-core'
import * as FormData from 'form-data'
import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { remove, RxRequestInit } from '../src/index'
import { HttpbinPostResponse, PDATA } from '../test/model'

const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 1000))

  describe('Should remove() works with httpbin.org', () => {
    const url = 'https://httpbin.org/delete'
    const initArgs = <RxRequestInit> { }

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
            assert(
              res.args.p1 === pdata.p1.toString(),
              `Should p1 get ${pdata.p1}, but got "${res.args && res.args.p1}"`,
            )
            assert(res.args.p2 === pdata.p2, `Should p2 get ${pdata.p2}, but got "${res.args && res.args.p2}"`)
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
            assert(
              res.args.p1 === pdata.p1.toString(),
              `Should p1 get ${pdata.p1}, but got "${res.args && res.args.p1}"`,
            )
            assert(res.args.p2 === pdata.p2, `Should p2 get ${pdata.p2}, bug got ${res.args && res.args.p2}`)
            assert(
              pdata.p3 && res.args['p3[foo]'] === pdata.p3.foo,
              `Should get ${pdata!.p3!.foo}, but got "${res.args && res.args['p3[foo]'].toString()}"`,
            )
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

    it.skip('send form', resolve => {
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
            assert(form && form.p1 === p1, `Should p1 get "${p1}", but got "${form && form.p1}"`)
            assert(form && form.p2 === p2, `Should p2 get "${p2}", but got "${form && form.p2}"`)
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
