import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'
import FormData from 'form-data'
import { Response } from 'node-fetch'

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

      // @ts-ignore
      const buf: ArrayBuffer = await processResponseType(resp, 'arrayBuffer')
      assert(buf && buf.byteLength === size)
    })

    // blob

    /**
     * formData() not supported by node-fetch yet.
     * https://github.com/bitinn/node-fetch#iface-body
     */
    it.skip('with formData (not supported by node-fetch yet)', async () => {
      const form = new FormData()
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      form.append('p1', p1)
      form.append('p2', p2)
      const resp = new Response(form, init)

      // @ts-ignore
      const ret: Map<string, string> = await processResponseType(resp, 'formData')
      assert(ret && ret.get('p1') === p1)
      assert(ret && ret.get('p2') === p2)
    })

    it('with raw', async () => {
      const size = Math.round(Math.random() * 100)
      const ab = new ArrayBuffer(size)
      const resp = new Response(ab, init)

      // @ts-ignore
      const res: Response = await processResponseType(resp, 'raw')
      assert(res && res.status === status)
      assert(res && res.statusText === statusText)

      const buf = await res.arrayBuffer()
      assert(buf && buf.byteLength === size)
    })

    it('with text', async () => {
      const foo = Math.random().toString()
      const resp = new Response(Buffer.from(foo), init)

      // @ts-ignore
      const txt: string = await processResponseType(resp, 'text')
      assert(txt && txt === foo)
    })

    it('with never value', async () => {
      const foo = 'neverValue:' + Math.random().toString()
      const resp = new Response(Buffer.from(foo), init)

      try {
        // @ts-ignore
        await processResponseType<'text'>(resp, foo)
      }
      catch (ex) {
        assert(ex && (ex as Error).message.includes(foo))
        return
      }
      assert(false, 'Should not go into here')
    })
  })

})
