/// <reference types="mocha" />

import * as assert from 'power-assert'
import * as QueryString from 'qs'

import { get, RxRequestInit } from '../src/index'
import { HttpbinGetResponse, PDATA } from '../test/model'

import { ab2str } from './util'


const filename = '20_get.test.ts'

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 1000))

  describe('Should get() works with httpbin.org', () => {
    const url = 'https://httpbin.org/get'
    const initArgs = <RxRequestInit> { }

    it('with dataType:"arrayBuffer"', resolve => {
      const args = { ...initArgs }
      args.dataType = 'arrayBuffer'

      get<ArrayBuffer>(url, args).subscribe(
        buf => {
          assert(buf && buf.byteLength > 0)

          const txt = buf.byteLength ? ab2str(buf) : ''
          assert(txt && txt.includes(url))

          resolve()
        },
        err => {
          assert(false, err)

          resolve()
        },
      )
    })

    it('with dataType:"blob"', resolve => {
      const args = { ...initArgs }
      args.dataType = 'blob'

      get<Blob>(url, args).subscribe(
        blob => {
          const fr = new FileReader()

          assert(blob && blob.size > 0)

          fr.onloadend = () => {
            const buf = <ArrayBuffer> fr.result
            assert(buf && buf.byteLength > 0)

            const txt = buf.byteLength ? ab2str(buf) : ''
            assert(txt && txt.includes(url))

            resolve()
          }
          fr.onerror = () => {
            assert(false, 'fr.readAsArrayBuffer(blob) throw error')

            resolve()
          }
          fr.readAsArrayBuffer(blob)

        },
        err => {
          assert(false, err)

          resolve()
        },
      )
    })

    it('with dataType:"raw"', resolve => {
      const args = { ...initArgs }
      args.dataType = 'raw'

      get<Response>(url, args).subscribe(
        resp => {
          resp.text()
            .then(txt => {
              assert(txt && txt.includes(url))

              resolve()
            })
            .catch(err => {
              assert(false, err)

              resolve()
            })
        },
        err => {
          assert(false, err)

          resolve()
        },
      )
    })

    it('with dataType:"text"', resolve => {
      const args = { ...initArgs }
      args.dataType = 'text'

      get<string>(url, args).subscribe(
        txt => {
          assert(txt && txt.includes(url))

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('with dataType:"unknown" transferred to "json" automatically', resolve => {
      const args = { ...initArgs }
      // @ts-ignore
      args.dataType = 'unknown'

      get<HttpbinGetResponse>(url, args).subscribe(
        res => {
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
  })


  describe('Should get() dataType:"json" works with httpbin.org', () => {
    const url = 'https://httpbin.org/get'
    const initData: PDATA = {
      p1: Math.random(),
      p2: Math.random().toString(),
    }
    const initArgs = <RxRequestInit> {
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
        },
        err => {
          assert(false, err)
          resolve()
        },
        resolve,
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
