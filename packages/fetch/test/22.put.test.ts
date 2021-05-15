import { basename } from '@waiting/shared-core'
import FormData from 'form-data'

import { put, Options, ContentTypeList } from '../src/index'

import { DELAY, HOST_PUT } from './config'
import { HttpbinPostResponse, PostForm1 } from './test.types'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should put() works with httpbin.org', () => {
    const url = HOST_PUT
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

      const res = await put<HttpbinPostResponse<typeof pdata>>(url, opts)
      assert(res && res.url === url)
      try {
        const { form } = res
        assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
        assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
      }
      catch (ex) {
        assert(false, ex)
      }
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

      const res = await put<HttpbinPostResponse<typeof pdata>>(url, opts)
      assert(res && res.url === url)
      try {
        const { form } = res
        assert(form && form.p1 === pdata.p1.toString(), `Should got "${pdata.p1}"`)
        assert(form && form.p2 === pdata.p2, `Should got "${pdata.p2}"`)
        assert(form && form['p3[foo]'] === pdata.p3.foo, `Should got "${pdata.p3.foo}"`)
      }
      catch (ex) {
        assert(false, ex)
      }
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

      const res = await put<HttpbinPostResponse<PostForm1>>(url, opts)
      assert(res && res.url === url)
      try {
        const { form } = res
        assert(form && form.p1 === p1.toString(), `Should got "${p1}"`)
        assert(form && form.p2 === p2, `Should got "${p2}"`)
      }
      catch (ex) {
        assert(false, ex)
      }
    })
  })

})

