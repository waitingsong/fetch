import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { FormData, Response } from '../src/index.js'
import { processResponseType } from '../src/lib/response.js'


describe(fileShortPath(import.meta.url), () => {

  describe('processResponseType() work', () => {
    const statusText = 'test resp'
    const status = 200
    const init = { status, statusText }

    it('with arrayBuffer', async () => {
      const size = Math.round(Math.random() * 100)
      const ab = new ArrayBuffer(size)
      const resp = new Response(ab, init)

      const buf: ArrayBuffer = await processResponseType(resp, 'arrayBuffer')
      assert(buf)
      assert(buf instanceof ArrayBuffer)
      assert(buf && buf.byteLength === size)
    })

    // blob

    it('with formData', async () => {
      const form = new FormData()
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      form.append('p1', p1)
      form.append('p2', p2)
      const resp = new Response(form, init)

      const ret: FormData = await processResponseType(resp, 'formData')
      assert(ret)
      assert(ret instanceof FormData)
      assert(ret.get('p1') === p1)
      assert(ret.get('p2') === p2)
    })

    it('with raw', async () => {
      const size = Math.round(Math.random() * 100)
      const ab = new ArrayBuffer(size)
      const resp = new Response(ab, init)

      const res: Response = await processResponseType(resp, 'raw')
      assert(res)
      assert(res instanceof Response)
      assert(res && res.status === status)
      assert(res && res.statusText === statusText)

      const buf = await res.arrayBuffer()
      assert(buf && buf.byteLength === size)
    })

    it('with text', async () => {
      const foo = Math.random().toString()
      const resp = new Response(Buffer.from(foo), init)

      const txt: string = await processResponseType(resp, 'text')
      assert(txt)
      assert(typeof txt === 'string')
      assert(txt && txt === foo)
    })

    it('with never value', async () => {
      const foo = 'neverValue:' + Math.random().toString()
      const resp = new Response(Buffer.from(foo), init)

      try {
        // @ts-expect-error
        const bar = await processResponseType(resp, foo)
        void bar
      }
      catch (ex) {
        assert(ex && (ex as Error).message.includes(foo))
        return
      }
      assert(false, 'Should not go into here')
    })
  })

})
