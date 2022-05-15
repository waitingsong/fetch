import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'
import { Response } from 'node-fetch'

import { FetchMsg } from '../src/index.js'
import { handleResponseError } from '../src/lib/response.js'


describe(fileShortPath(import.meta.url), () => {

  describe('handleResponseError() work', () => {
    it('pass ok', async () => {
      const statusText = 'test resp'
      const status = 200
      const init = { status, statusText }
      const resp = new Response('', init)

      // @ts-ignore
      const res = await handleResponseError(resp)
      // assert(res.size === 0)
      assert(res.status === 200)
      assert(res.statusText === statusText)
    })

    it('catch error', async () => {
      const statusText = 'test resp error'
      const status = 500
      const init = { status, statusText }
      const resp = new Response('', init)

      try {
        // @ts-ignore
        await handleResponseError(resp)
      }
      catch (ex) {
        const err = ex as Error
        assert(!! err && err instanceof Error && err.message.length)
        const msg = err.message
        assert(msg.includes(`${FetchMsg.httpErrorMsgPrefix}${status}`))
        assert(msg.includes(`statusText: ${statusText}`))
        return
      }
      assert(false, 'Should not go into here')
    })

    it('catch error with invalid Response', async () => {
      const status = 500
      const init = { ok: false, status }
      const resp = new Response('', init)

      try {
        // @ts-ignore
        await handleResponseError(resp)
      }
      catch (ex) {
        const err = ex as Error
        assert(!! err && err instanceof Error && err.message.length)
        const msg = err.message
        // const reg = /Response: TypeError.+text/
        assert(msg.includes(`${FetchMsg.httpErrorMsgPrefix}${status}`))
        // assert(msg.includes('TypeError: resp.text is not a function'))
        // assert(msg.includes('statusText: undefined'))
        return
      }
      assert(false, 'Should not go into here')
    })

    it('no error with bare:true', async () => {
      const statusText = 'test resp error'
      const status = 500
      const init = { status, statusText }
      const resp = new Response('', init)

      // @ts-ignore
      const res = await handleResponseError(resp, true)
      assert(res && res.ok === false)
      assert(res && res.statusText.includes(statusText))
    })
  })
})

