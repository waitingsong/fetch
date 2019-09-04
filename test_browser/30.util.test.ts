import * as assert from 'power-assert'

import { Args, ArgsRequestInitCombined, RxRequestInit } from '../src/index'
import { selectFecthModule } from '../src/lib/util'


const filename = '30_util.test.ts'

describe(filename, () => {
  const fnName = 'selectFecthModule'

  describe(`Should ${fnName}() works`, () => {
    it('with invalid parameter', () => {
      try {
        // @ts-ignore
        selectFecthModule('foo')
        assert(false, 'Should get error but NOT')
      }
      catch {
        assert(true)
      }
    })

    it('with valid parameter', () => {
      // @ts-ignore
      const ret = selectFecthModule(fetch)
      assert(ret === fetch)
    })

    it('with global parameter', () => {
      const ret = selectFecthModule(null)
      assert(ret === fetch)
    })
  })

})
