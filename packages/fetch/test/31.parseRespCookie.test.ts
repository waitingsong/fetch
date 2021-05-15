import { basename } from '@waiting/shared-core'

import { parseRespCookie } from '../src/lib/util'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

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

})
