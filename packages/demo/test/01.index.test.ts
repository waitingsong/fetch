import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { foo } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('foo', () => {
      assert(foo === 1)
    })
  })

})

