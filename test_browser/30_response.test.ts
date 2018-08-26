/// <reference types="mocha" />

import * as assert from 'power-assert'

import {
  get,
  Args,
} from '../src/index'
import { httpErrorMsgPrefix } from '../src/lib/config'
import {
  handleResponseError,
  parseResponseType,
  parseRespCookie,
} from '../src/lib/response'

import { str2u8ab } from './util'


const filename = '30_response.test.ts'

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, 2000))

  describe('parseRespCookie() works', () => {
    it('with valid input', () => {
      const value = Math.random().toString()
      const cookie = `foo=${value}; Secure; Path=/`
      const ret = parseRespCookie(cookie)

      assert(ret && ret.foo === value, `Should get "${value}"`)
    })

    it('with invalid input', () => {
      let cookie = 'foo.bar; Secure; Path=/'
      let ret = parseRespCookie(cookie)
      assert(! ret)

      cookie = 'Secure; Path=/'
      ret = parseRespCookie(cookie)
      assert(! ret)

      cookie = ';;Secure; Path=/'
      ret = parseRespCookie(cookie)
      assert(! ret)
    })

    it('with blank input', () => {
      const cookie = ''
      const ret = parseRespCookie(cookie)

      assert(! ret)
    })

    it('with null input', () => {
      const cookie = null
      const ret = parseRespCookie(cookie)

      assert(! ret)
    })
  })


  describe('handleResponseError() works', () => {
    it('pass ok', resolve => {
      const statusText = 'test resp'
      const status = 200
      const init = { status, statusText }
      const resp = new Response('', init)

      // @ts-ignore
      handleResponseError(resp).subscribe(
        res => {
          assert(res.status === 200)
          assert(res.statusText === statusText)

          resolve()
        },
        (err: any) => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('catch error', resolve => {
      const statusText = 'test resp error'
      const status = 500
      const init = { status, statusText }
      const resp = new Response('', init)

      // @ts-ignore
      handleResponseError(resp).subscribe(
        () => {
          assert(false, 'Should not go into here')
          resolve()
        },
        (err: Error) => {
          assert(!!err && err.message.length)
          const msg = err.message
          assert(msg.includes(`${httpErrorMsgPrefix}${status}`))
          assert(msg.includes(`statusText: ${statusText}`))

          resolve()
        },
      )
    })

    it('catch error with invalid Response', resolve => {
      const status = 500
      const resp = { ok: false, status }

      // @ts-ignore
      handleResponseError(resp).subscribe(
        () => {
          assert(false, 'Should not go into here')

          resolve()
        },
        (err: Error) => {
          assert(!!err && err.message.length)
          const msg = err.message
          const reg = /Response: TypeError.+text/
          assert(msg.includes(`${httpErrorMsgPrefix}${status}`))
          assert(msg.includes('statusText: undefined'))

          resolve()
        },
      )
    })

    it('no error with bare:true', resolve => {
      const statusText = 'test resp error'
      const status = 500
      const init = { status, statusText }
      const resp = new Response('', init)

      // @ts-ignore
      handleResponseError(resp, true).subscribe(
        res => {
          assert(res
            && res.ok === false
            && res.status === status
            && res.statusText.includes(statusText))
          resolve()
        },
        () => {
          assert(false, 'Should not go into here')

          resolve()
        },
      )
    })
  })


  describe('parseResponseType() works', () => {
    const statusText = 'test resp'
    const status = 200
    const init = { status, statusText }

    it('with arrayBuffer', resolve => {
      if (! ArrayBuffer && typeof ArrayBuffer.isView !== 'function') {
        return resolve()
      }
      const size = Math.round(Math.random() * 100)
      const ab = new ArrayBuffer(size)
      const resp = new Response(ab, init)

      // @ts-ignore
      parseResponseType<'arrayBuffer'>(resp, 'arrayBuffer').subscribe(
        (buf: ArrayBuffer) => {
          assert(buf && buf.byteLength === size)

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    // blob

    /**
     * formData() not supported by node-fetch yet.
     * https://github.com/bitinn/node-fetch#iface-body
     */
    it.skip('with formData (IE will fail)', resolve => {
      const form = new FormData()
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      form.append('p1', p1)
      form.append('p2', p2)
      const resp = new Response(form, init)

      // @ts-ignore
      parseResponseType<'formData'>(resp, 'formData').subscribe(
        ret => {
          assert(ret && ret.get('p1') === p1)
          assert(ret && ret.get('p2') === p2)

          resolve()
        },
        (err: any) => {
          assert(false, err.toString())
          resolve()
        },
      )
    })

    it('with raw', resolve => {
      const size = Math.round(Math.random() * 100)
      const ab = new ArrayBuffer(size)
      const resp = new Response(ab, init)

      // @ts-ignore
      parseResponseType<'raw'>(resp, 'raw').subscribe(
        res => {
          assert(res && res.status === status)
          assert(res && res.statusText === statusText)

          res.arrayBuffer()
            .then(buf => {
              assert(buf && buf.byteLength === size)
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

    it('with text', resolve => {
      // const size = Math.round(Math.random() * 100)
      // const ab = new ArrayBuffer(size)
      const foo = Math.random().toString()
      const ab = str2u8ab(foo)
      const resp = new Response(ab, init)

      // @ts-ignore
      parseResponseType<'text'>(resp, 'text').subscribe(
        txt => {
          assert(txt && txt === foo)

          resolve()
        },
        err => {
          assert(false, err)
          resolve()
        },
      )
    })

    it('with never value', resolve => {
      const foo = 'neverValue:' + Math.random().toString()
      const resp = new Response(Buffer.from(foo), init)

      // @ts-ignore
      parseResponseType<'text'>(resp, foo).subscribe(
        () => {
          assert(false, 'Should not go into here')

          resolve()
        },
        (err: Error) => {
          assert(err && err.message.includes(foo))
          resolve()
        },
      )
    })
  })

})
