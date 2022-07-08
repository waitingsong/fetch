import assert from 'node:assert/strict'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fileShortPath } from '@waiting/shared-core'
import FormData from 'form-data'

import { post, Options, ContentTypeList } from '../src/index.js'

import { DELAY, HOST_POST } from './config.js'
import { HttpbinPostResponse, PostForm1 } from './test.types.js'


const __filename = fileURLToPath(import.meta.url)

describe(fileShortPath(import.meta.url), function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should post() work with httpbin.org', () => {
    const url = HOST_POST
    const initOpts = {
      contentType: ContentTypeList.formDataPartial,
    } as Options

    it('post Form contains an image file via Stream', (done) => {
      const path = join(__filename, '../images/loading-1.gif')
      const stream1 = createReadStream(path)
      const stream2 = createReadStream(path)

      const pdata = new FormData()
      const p1 = Math.random()
      const p2 = Math.random().toString()
      pdata.append('p1', p1)
      pdata.append('p2', p2)
      pdata.append('uploadFile', stream1)
      const opts: Options = {
        ...initOpts,
        data: pdata,
        processData: false,
        contentType: false,
      }

      let buf: Buffer = Buffer.alloc(0)

      stream2.on('data', (data: Buffer) => {
        buf = Buffer.concat([buf, data])
      })
      stream2.on('error', () => {
        assert(false, 'read file failed')
        done()
      })

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      stream2.on('end', async () => {

        const res = await post<HttpbinPostResponse<PostForm1>>(url, opts)
        assert(res && res.url === url)
        const { form } = res
        assert(form && form.p1 === p1.toString(), `Should got "${p1}"`)
        assert(form && form.p2 === p2, `Should got "${p2}"`)

        if (! res.files) {
          assert(false)
          return
        }
        const { uploadFile } = res.files
        assert(typeof uploadFile === 'string' && uploadFile)
        // console.log({ res })
        const base64 = buf.toString('base64')
        assert(
          uploadFile === 'data:image/gif;base64,' + base64,
          `Should get "${base64.slice(0, 50)}..." but got ${res && res.data}`,
        )

        done()
      })
    })

    it('post Form contains an image file via Buffer', (done) => {
      const path = join(__filename, '../images/loading-1.gif')
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
  })

})
