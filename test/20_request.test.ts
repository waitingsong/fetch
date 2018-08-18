/// <reference types="mocha" />

import * as assert from 'power-assert'
import rewire = require('rewire')

import {
  Args,
} from '../src/index'
import { basename } from '../src/shared/index'


const filename = basename(__filename)
const mods = rewire('../src/lib/request')

describe(filename, () => {
  const fnName = 'parseTimeout'
  const fn = <(p: any) => number | null> mods.__get__(fnName)

  describe(`Should ${fnName}() works`, () => {
    it('with param zero', () => {
      const ret = fn(0)
      assert(ret === 0, `Should got result zero, but got "${ret}" `)
    })

    it('with param positive integer', () => {
      const values = [1, 99, 1000, Math.ceil(Math.random() * 100)]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === value, `Should got result "${value}, but got "${ret}" `)
      }
    })

    it('with param positive float', () => {
      const values = [1.2, 99.0, 1000.123, (Math.random() * 100)]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === Math.ceil(value), `Should got result "${Math.ceil(value)}, but got "${ret}" `)
      }
    })

    it('with param negative number', () => {
      const values = [-1, -99, -1.2, -1000.123, -(Math.random() * 100)]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === null, `Should got result NULL, but got "${ret}" `)
      }
    })

    it('with param none number', () => {
      const values = ['', '_', '-1', '-1.2', '1', '1000', 'a', '1a', 'a1', '0x8', true, false, null]

      for (const value of values) {
        const ret = fn(value)
        assert(ret === null, `Should got result NULL, but got "${ret}" `)
      }
    })
  })

})


describe(filename, () => {
  const fnName = 'parseDataType'
  const fn = <(value: any) => Required<Args['dataType']>> mods.__get__(fnName)

  describe(`Should ${fnName}() works`, () => {
    it('with blank', () => {
      const ret = fn('')
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)
    })

    it('with invalid value', () => {
      let ret = fn('fake')
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)

      ret = fn(null)
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)

      ret = fn(0)
      assert(ret === 'json', `Should got result "json", but got "${ret}" `)
    })

    it('with valid string', () => {
      const ret = fn('raw')
      assert(ret === 'raw', `Should got result "json", but got "${ret}" `)
    })
  })

})
