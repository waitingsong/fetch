import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'
import FormData from 'form-data'
import QueryString from 'qs'

import { remove, Options } from '../src/index.js'

import { DELAY, HOST_DELETE } from './config.js'
import { HttpbinPostResponse, PDATA } from './test.types.js'


describe(fileShortPath(import.meta.url), function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should remove() work with httpbin.org', () => {
    const url = HOST_DELETE
    const initOpts = {} as Options

    it('send key:value object data', async () => {
      const pdata: PDATA = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await remove<HttpbinPostResponse<PDATA>>(url, opts)
      try {
        assert(res && res.args, 'Should response.args not empty')
        assert(res.url === url + '?' + QueryString.stringify(pdata))
        assert(
          res.args.p1 === pdata.p1.toString(),
          `Should p1 get ${pdata.p1}, but got "${res.args && res.args.p1}"`,
        )
        assert(res.args.p2 === pdata.p2, `Should p2 get ${pdata.p2}, but got "${res.args && res.args.p2}"`)
      }
      catch (ex) {
        assert(false, (ex as Error).message)
      }
    })

    it('send nested key:value object data', async () => {
      const foo = Math.random().toString()
      const pdata: PDATA = {
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: { foo },
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await remove<HttpbinPostResponse<PDATA>>(url, opts)
      const sendUrl = decodeURI(url + '?' + QueryString.stringify(pdata))
      try {
        assert(res && res.args, 'Should response.args not empty')
        assert(res.url === sendUrl, `Should get ${sendUrl}, but got ${res.url}`)
        assert(
          res.args.p1 === pdata.p1.toString(),
          `Should p1 get ${pdata.p1}, but got "${res.args && res.args.p1}"`,
        )
        assert(res.args.p2 === pdata.p2, `Should p2 get ${pdata.p2}, bug got ${res.args && res.args.p2}`)
        assert(
          pdata.p3 && res.args['p3[foo]'] === foo,
          `Should get ${foo}`,
        )
      }
      catch (ex) {
        assert(false, (ex as Error).message)
      }
    })

    it.skip('send form', async () => {
      const pdata = new FormData()
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const opts: Options = {
        ...initOpts, data: pdata, processData: false, contentType: false,
      }

      const res = await remove<HttpbinPostResponse<Record<'p1' | 'p2', string>>>(url, opts)
      assert(res && res.url === url)

      try {
        const { form } = res
        assert(form && form.p1 === p1, `Should p1 get "${p1}", but got "${form && form.p1}"`)
        assert(form && form.p2 === p2, `Should p2 get "${p2}", but got "${form && form.p2}"`)
      }
      catch (ex) {
        assert(false, (ex as Error).message)
      }
    })
  })

})
