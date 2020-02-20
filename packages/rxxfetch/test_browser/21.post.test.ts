/* eslint-disable max-lines-per-function */
import * as assert from 'power-assert'
import { retry } from 'rxjs/operators'

import { post, RxRequestInit } from '../src/index'
import { HttpbinPostResponse } from '../test/model'


const filename = '21_post.test.ts'

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  describe('Should post() works with httpbin.org', () => {
    const url = 'https://httpbin.org/post'
    const initArgs = {
      timeout: 60 * 1000,
    } as RxRequestInit

    it('without parameter init', (resolve) => {
      post<HttpbinPostResponse>(url).subscribe(
        (res) => {
          assert(res && res.url === url)
          resolve()
        },
        (err) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('send key:value object data', (resolve) => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const args = { ...initArgs }
      args.data = { ...pdata }

      post<HttpbinPostResponse>(url, args).subscribe(
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

      post<HttpbinPostResponse>(url, args).subscribe(
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
      pdata.append('p1', p1.toString())
      pdata.append('p2', p2)

      const args: RxRequestInit = {
        ...initArgs, data: pdata, processData: false, contentType: false,
      }

      post<HttpbinPostResponse>(url, args).pipe(
        retry(2),
      ).subscribe(
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
        },
      )
    })

    it('send a file', (resolve) => {
      const pdata = new FormData()
      const p1 = Math.random().toString()
      const content = '<a id="a"><b id="b">hey!</b></a>'
      const blob = new Blob([content], { type: 'text/xml' })
      pdata.append('p1', p1)
      pdata.append('p2', blob, 'nameFoo')
      const args: RxRequestInit = {
        ...initArgs, data: pdata, processData: false, contentType: false,
      }

      post<HttpbinPostResponse>(url, args).pipe(
        retry(2),
      )
        .subscribe(
          (res) => {
            assert(res && res.url === url)

            const { files, form } = res
            assert(form && form.p1 === p1, `Should got "${p1}"`)
            assert(files && files.p2 === content, `Should got "${content}"`)
            resolve()
          },
          (err) => {
            assert(false, err)
            resolve()
          },
        )
    })

    it.skip('send a file via Blob', (resolve) => {
      const content = '<a id="a"><b id="b">hey!</b></a>'
      const blob = new Blob([content], { type: 'text/xml' })
      const args: RxRequestInit = {
        ...initArgs, data: blob, processData: false, contentType: false,
      }

      post<HttpbinPostResponse>(url, args).pipe(
        retry(2),
      )
        .subscribe(
          (res) => {
            assert(res && res.url === url)

            const { data } = res
            assert(data && data === content, `Should get "${content}", but got "${data}"`)
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
