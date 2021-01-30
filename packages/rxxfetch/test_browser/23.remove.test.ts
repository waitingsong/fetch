/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-lines-per-function */
import QueryString from 'qs'

import { remove, RxRequestInit } from '../src/index'
import { HttpbinPostResponse, PDATA } from '../test/model'

import { DELAY, HOST_DELETE } from './config'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = '20_remove.test.ts'

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should remove() works with httpbin.org', () => {
    const url = HOST_DELETE
    const initArgs = {
      timeout: 60 * 1000,
    } as RxRequestInit

    it('without parameter init', (done) => {
      remove<HttpbinPostResponse>(url).subscribe(
        (res) => {
          assert(res && res.url === url)
          done()
        },
        (err) => {
          assert(false, err)
        },
      )
    })

    it('send key:value object data', (resolve) => {
      const pdata: PDATA = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      remove<HttpbinPostResponse>(url, args).subscribe(
        (res) => {
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
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('send nested key:value object data', (resolve) => {
      const foo = Math.random().toString()
      const pdata: PDATA = {
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: { foo },
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      remove<HttpbinPostResponse>(url, args).subscribe(
        (res) => {
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
              pdata.p3 && res.args['p3[foo]'] === foo,
              `Should get ${foo}, but got "${res.args && res.args['p3[foo]'].toString()}"`,
            )
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

    it.skip('send form', (resolve) => {
      const pdata = new FormData()
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const args: RxRequestInit = {
        ...initArgs, data: pdata, processData: false, contentType: false,
      }

      remove<HttpbinPostResponse>(url, args).subscribe(
        (res) => {
          assert(res && res.url === url)

          try {
            const { form } = res
            assert(form && form.p1 === p1, `Should p1 get "${p1}", but got "${form && form.p1}"`)
            assert(form && form.p2 === p2, `Should p2 get "${p2}", but got "${form && form.p2}"`)
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
