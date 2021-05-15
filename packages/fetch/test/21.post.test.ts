import { createReadStream } from 'fs'

import { basename, join, readFileAsync } from '@waiting/shared-core'
import FormData from 'form-data'

import { post, Options, ContentTypeList } from '../src/index'

import { DELAY, HOST_POST } from './config'
import { HttpbinPostResponse, PostForm1 } from './test.types'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should post() works with httpbin.org', () => {
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
      assert(form && form.p1 === p1.toString(), `Should got "${p1}"`)
      assert(form && form.p2 === p2, `Should got "${p2}"`)
    })

    it('send a txt file and key:value data via FormData', async () => {
      const buf = await readFileAsync(join(__dirname, 'p2.txt'))

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

    it('send an image file via Buffer', (done) => {
      const path = join(__dirname, 'images/loading-1.gif')
      const readerStream = createReadStream(path)
      const readerStream2 = createReadStream(path)
      const args: Options = {
        ...initOpts, data: readerStream, processData: false, contentType: false,
      }
      let buf: Buffer = Buffer.alloc(0)

      readerStream2.on('data', (data: Buffer) => {
        buf = Buffer.concat([buf, data])
      })
      readerStream2.on('error', () => {
        assert(false, 'read file failed')
        done()
      })

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      readerStream2.on('end', async () => {
        const res = await post<HttpbinPostResponse>(url, args)
        const base64 = buf.toString('base64')
        assert(res && res.url === url)
        assert(
          res.data && res.data === 'data:application/octet-stream;base64,' + base64,
          `Should get "${base64.slice(0, 50)}..." but got ${res && res.data}`,
        )

        done()
      })
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
