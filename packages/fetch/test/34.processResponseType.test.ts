import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'
import { Response } from 'undici'

import { get, fetch } from '../src/index.js'

import { HOST_GET } from './config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('beforeProcessResponseCallback() work', () => {
    it('get()', async () => {
      const url = HOST_GET
      const txt = await get<string>(url, {
        dataType: 'text',
        beforeProcessResponseCallback,
      })
      assert(txt?.includes(url))
    })
  })

})

async function beforeProcessResponseCallback(input: Response): Promise<Response> {
  assert(input)
  assert(input.ok)
  assert(input.status === 200)
  assert(input.headers)
  // const h1 = input.headers.get('Content-Type')
  // assert(h1 === 'text/plain', h1)

  return input
}
