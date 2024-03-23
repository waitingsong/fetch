import assert from 'node:assert/strict'
import { Blob as NodeBlob } from 'node:buffer'
import { createReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fileShortPath } from '@waiting/shared-core'

import { post, FormData, Options, ContentTypeList } from '../src/index.js'

import { DELAY, HOST_POST } from './config.js'
import { HttpbinPostResponse, PostForm1 } from './test.types.js'


const __filename = fileURLToPath(import.meta.url)

const path = join(__filename, '../images/loading-1.gif')
const buf = await readFile(path)
const blob = typeof Blob === 'undefined'
  ? new NodeBlob([buf], { type: 'image/gif' })
  : new Blob([buf], { type: 'image/gif' })

describe(fileShortPath(import.meta.url), function () {
  this.retries(1)

  beforeEach((done) => {
    setTimeout(done, DELAY)
  })

  describe('Should post() work with httpbin.org', () => {
    const url = HOST_POST
    const initOpts = {
      contentType: ContentTypeList.formDataPartial,
    } as Options


    it('post an image file via Blob', async () => {
      const args: Options = {
        ...initOpts, data: blob, processData: false, contentType: false,
      }

      const res = await post<HttpbinPostResponse>(url, args)
      const base64 = buf.toString('base64')
      assert(res && res.url === url)
      assert(res.data, 'res.data should not be empty')
      assert(
        res.data === 'data:application/octet-stream;base64,' + base64,
        `Should get "${base64.slice(0, 50)}..." but got ${res?.data}`,
      )

    })

    it('post Form contains an image file via Blob', async () => {
      const pdata = new FormData()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)
      pdata.append('uploadFile', blob, 'loading-1.gif')
      const opts: Options = {
        ...initOpts,
        data: pdata,
        processData: false,
        contentType: false,
      }

      const res = await post<HttpbinPostResponse>(url, opts)

      if (! res.files) {
        assert(false)
      }
      const { uploadFile } = res.files
      assert(typeof uploadFile === 'string' && uploadFile)
      const base64 = buf.toString('base64')
      assert(
        uploadFile === 'data:image/gif;base64,' + base64,
        `Should get "${base64.slice(0, 50)}..." but got ${res?.data}`,
      )

    })


    it.skip('post Form contains an image file via Stream - not working', async () => {
      const stream1 = createReadStream(path)

      const pdata = new FormData()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)
      // pdata.append('uploadFile', stream1, 'loading-1.gif')
      pdata.append('uploadFile', stream1)
      const opts: Options = {
        ...initOpts,
        data: pdata,
        processData: false,
        contentType: false,
      }

      const res = await post<HttpbinPostResponse<PostForm1>>(url, opts)
      assert(res && res.url === url)
      const { form } = res
      assert(form && form.p1 === p1.toString(), `Should got "${p1}"`)
      assert(form && form.p2 === p2, `Should got "${p2}"`)

      if (! res.files) {
        assert(false)
      }
      const { uploadFile } = res.files
      assert(typeof uploadFile === 'string' && uploadFile)
      // console.log({ res })
      const base64 = buf.toString('base64')
      assert(
        uploadFile === 'data:image/gif;base64,' + base64,
        `Should get "${base64.slice(0, 50)}..." but got ${res?.data}`,
      )

    })

    it.skip('post Form contains an image file via Buffer - not working', async () => {
      const readerStream = createReadStream(path)
      const args: Options = {
        ...initOpts, data: readerStream, processData: false, contentType: false,
      }

      const res = await post<HttpbinPostResponse>(url, args)
      const base64 = buf.toString('base64')
      assert(res && res.url === url)
      assert(
        res.data && res.data === 'data:application/octet-stream;base64,' + base64,
        `Should get "${base64.slice(0, 50)}..." but got ${res?.data}`,
      )

    })
  })

})
