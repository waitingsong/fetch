import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fileShortPath } from '@waiting/shared-core'
import { FormData } from 'undici'

import type { Options } from '../src/index.js'
import { ContentTypeList, post } from '../src/index.js'

import { DELAY, HOST_POST } from './config.js'
import type { HttpbinPostResponse, PostForm1 } from './test.types.js'


const __filename = fileURLToPath(import.meta.url)

describe(fileShortPath(import.meta.url), function () {
  this.retries(1)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should post() work with httpbin.org', () => {
    const url = HOST_POST
    const initOpts = {
      contentType: ContentTypeList.formUrlencoded,
    } as Options

    it('send key:value object data', async () => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await post<HttpbinPostResponse<PostForm1>>(url, opts)
      assert(res && res.url === url)
      const { form } = res
      assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
      assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
    })

    it('send nested key:value object data', async () => {
      const pdata = {
        p1: Math.random(),
        p2: Math.random().toString(),
        p3: {
          foo: Math.random().toString(),
        },
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await post<HttpbinPostResponse<typeof pdata>>(url, opts)
      assert(res && res.url === url)
      const { form } = res
      assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
      assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
      assert(form && form['p3[foo]'] === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
    })

    it('send form', async () => {
      const pdata = new FormData()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)

      const opts: Options = {
        ...initOpts, data: pdata, processData: false, contentType: false,
      }

      const res = await post<HttpbinPostResponse<PostForm1>>(url, opts)
      assert(res && res.url === url)
      const { form } = res
      assert(form && form.p1 === p1.toString(), `Should get "${p1}", but got "${form.p1}"`)
      assert(form && form.p2 === p2, `Should got "${p2}", but got "${form.p2}"`)
    })

    // it('error FormData from pkg "form-data"', async () => {
    //   const pdata = new NodeFormData()
    //   const p1 = Math.random()
    //   const p2 = Math.random().toString()
    //   pdata.append('p1', p1)
    //   pdata.append('p2', p2)

    //   const opts: Options = {
    //     ...initOpts, data: pdata, processData: false, contentType: false,
    //   }

    //   try {
    //     await post<HttpbinPostResponse<PostForm1>>(url, opts)
    //   }
    //   catch (ex) {
    //     assert(ex instanceof TypeError, 'Should got TypeError')
    //     return
    //   }
    //   assert(false, 'Should throw TypeError')
    // })

    it('send a txt file and key:value data via FormData', async () => {
      const buf = await readFile(join(__filename, '../p2.txt'))

      const pdata = new FormData()
      const p1 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', buf)
      const args: Options = {
        ...initOpts, data: pdata, processData: false, contentType: false,
      }

      const res = await post<HttpbinPostResponse<PostForm1>>(url, args)
      assert(res && res.url === url)

      const form = res.form
      const str = '<FileList><P00001.jpg /></FileList>'
      assert(form && form.p1 === p1, `Should got "${p1}"`)
      assert(form && form.p2 === str, `Should got "${str}"`)
    })

    it('with URLSearchParams', async () => {
      const p1 = Math.random().toString()
      const p2 = Math.random().toString()
      const pdata = new URLSearchParams()
      pdata.append('p1', p1)
      pdata.append('p2', p2)
      const opts = { ...initOpts }
      opts.data = pdata

      const res = await post<HttpbinPostResponse<PostForm1>>(url, opts)
      assert(res && res.url === url)
      const { form } = res
      assert(form && form.p1 === p1)
      assert(form && form.p2 === p2)
    })
  })

})
