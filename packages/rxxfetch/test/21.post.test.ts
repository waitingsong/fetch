/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createReadStream } from 'fs'

import { basename, join, readFileAsync } from '@waiting/shared-core'
import FormData from 'form-data'
import { defer } from 'rxjs'
import { retry, switchMap, tap } from 'rxjs/operators'

import { post, RxRequestInit, ContentTypeList } from '../src/index'

import { HttpbinPostResponse } from './model'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  describe('Should post() works with httpbin.org', () => {
    const url = 'https://httpbin.org/post'
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
          foo: Math.random().toString(),
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
      pdata.append('p1', p1)
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

    it('send a txt file and key:value data via FormData', (resolve) => {
      const read$ = defer(() => readFileAsync(join(__dirname, 'p2.txt')))

      read$.pipe(
        switchMap((buf: Buffer) => {
          const pdata = new FormData()
          const p1 = Math.random().toString()
          pdata.append('p1', p1)
          pdata.append('p2', buf)
          const args: RxRequestInit = {
            ...initArgs, data: pdata, processData: false, contentType: false,
          }

          return post<HttpbinPostResponse>(url, args).pipe(
            retry(2),
            tap((res) => {
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
          (err) => {
            assert(false, err)
            resolve()
          },
        )
    })

    it('send an image file via Buffer', (resolve) => {
      const path = join(__dirname, 'images/loading-1.gif')
      const readerStream = createReadStream(path)
      const readerStream2 = createReadStream(path)
      const args: RxRequestInit = {
        ...initArgs, data: readerStream, processData: false, contentType: false,
      }
      let buf: Buffer = Buffer.alloc(0)
      const stream$ = post<HttpbinPostResponse>(url, args).pipe(
        retry(2),
        tap((res) => {
          const base64 = buf.toString('base64')
          assert(res && res.url === url)
          assert(
            res.data && res.data === 'data:application/octet-stream;base64,' + base64,
            `Should get "${base64.slice(0, 50)}..." but got ${res && res.data}`,
          )
        }),
      )

      readerStream2.on('data', (data: Buffer) => {
        buf = Buffer.concat([buf, data])
      })
      readerStream2.on('error', () => {
        assert(false, 'read file failed')
        resolve()
      })

      readerStream2.on('end', () => {
        stream$.subscribe(
          () => {
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

})
