/// <reference types="mocha" />

import * as FormData from 'form-data'
import nodefetch, { Headers } from 'node-fetch'
import * as assert from 'power-assert'
import { defer } from 'rxjs'
import { retry, switchMap, tap } from 'rxjs/operators'

import { post, RxRequestInit } from '../src/index'
import { basename, readFileAsync } from '../src/shared/index'

import { HttpbinPostResponse } from './model'


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  describe('Should post() works with httpbin.org', () => {
    const url = 'https://httpbin.org/post'
    const initArgs = <RxRequestInit> {
      fetchModule: nodefetch,
      headersInitClass: Headers,
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
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
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
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const args: RxRequestInit = { ...initArgs, data: pdata, processData: false, contentType: false }

      post<HttpbinPostResponse>(url, args).pipe(
        retry(2),
      ).subscribe(
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
          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('send a txt file and key:value data', resolve => {
      const read$ = defer(() => readFileAsync(`${__dirname}/p2.txt`))

      read$.pipe(
        switchMap((buf: Buffer) => {
          const pdata = new FormData()
          const p1 = Math.random().toString()
          pdata.append('p1', p1)
          pdata.append('p2', buf)
          const args: RxRequestInit = { ...initArgs, data: pdata, processData: false, contentType: false }

          return post<HttpbinPostResponse>(url, args).pipe(
            retry(2),
            tap(res => {
              assert(res && res.url === url)

              const form = res.form
              const str = '<FileList><P00001.jpg /></FileList>'
              assert(form && form.p1 === p1, `Should got "${p1}"`)
              assert(form && form.p2 === str, `Should got "${str}"`)
            }),
          )
        }),
      )
        .subscribe(
          () => {
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
