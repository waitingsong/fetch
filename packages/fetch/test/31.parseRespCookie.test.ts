import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { parseRespCookie } from '../src/lib/util.js'


describe(fileShortPath(import.meta.url), () => {

  describe('parseRespCookie() work', () => {
    it('with valid input', () => {
      const value = Math.random().toString()
      const cookie = `foo=${value}; Secure; Path=/`
      const ret = parseRespCookie(cookie)

      assert(ret && ret['foo'] === value, `Should get "${value}"`)
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

})
