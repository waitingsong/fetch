/// <reference types="mocha" />

import * as assert from 'power-assert'

import {
  get,
  Args,
} from '../src/index'
import { httpErrorMsgPrefix } from '../src/lib/config'
import { handleResponseError, parseRespCookie } from '../src/lib/response'


const filename = '30_response.test.ts'

describe(filename, () => {
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
          assert(reg.test(msg))

          resolve()
        },
      )
    })
  })

})
