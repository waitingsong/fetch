import assert from 'node:assert/strict'

import { ab2str, fileShortPath } from '@waiting/shared-core'
import QueryString from 'qs'

import { get, Options } from '../src/index.js'

import { DELAY, HOST_GET } from './config.js'
import { HttpbinGetResponse, PDATA, PostForm1 } from './test.types.js'


describe(fileShortPath(import.meta.url), function() {

  this.retries(3)

  describe('Should get() work with httpbin.org', () => {
    const url = HOST_GET
    const initOpts = {} as Options

    it('with dataType:"arrayBuffer"', async () => {
      const opts = { ...initOpts }
      opts.dataType = 'arrayBuffer'

      const buf = await get<ArrayBuffer>(url, opts)
      assert(buf && buf.byteLength > 0)

      const txt = buf.byteLength ? ab2str(buf) : ''
      assert(txt && txt.includes(url))
    })

    it.skip('with dataType:"blob"', (done) => {
      const opts = { ...initOpts }
      opts.dataType = 'blob'

      get<Blob>(url, opts).then((blob) => {
        const fr = new FileReader()
        assert(blob && blob.size > 0)

        fr.onloadend = () => {
          const buf = fr.result as ArrayBuffer
          assert(buf && buf.byteLength > 0)

          const txt = buf.byteLength ? ab2str(buf) : ''
          assert(txt && txt.includes(url))
          done()
        }
        fr.onerror = () => {
          assert(false, 'fr.readAsArrayBuffer(blob) throw error')
          done()
        }
        fr.readAsArrayBuffer(blob)
      })
        .catch((err) => {
          assert(false, (err as Error).message)
          done()
        })

    })

    it('with dataType:"raw"', async () => {
      const opts = { ...initOpts }
      opts.dataType = 'raw'

      const resp = await get<Response>(url, opts)
      const txt = await resp.text()
      assert(txt && txt.includes(url))
    })

    it('with dataType:"text"', async () => {
      const opts = { ...initOpts }
      opts.dataType = 'text'

      const txt = await get<string>(url, opts)
      assert(txt && txt.includes(url))
    })

    it('with dataType:"unknown" transferred to "json" automatically', async () => {
      const opts = { ...initOpts }
      // @ts-ignore
      opts.dataType = 'unknown'

      const res = await get<HttpbinGetResponse>(url, opts)
      assert(!! res, 'Should response not empty')
      assert(res.url === url)
    })
  })


  describe('Should get() dataType:"json" work with httpbin.org', () => {
    const url = HOST_GET
    const initData: PDATA = {
      p1: Math.random(),
      p2: Math.random().toString(),
    }
    const initOpts = {
      timeout: 20 * 1000,
      dataType: 'json',
    } as Options

    it('without query data', async () => {
      const opts = { ...initOpts }

      const res = await get<HttpbinGetResponse>(url, opts)
      assert(!! res, 'Should response not empty')
      assert(res.url === url)
    })

    it('with query data', async () => {
      const pdata = { ...initData }
      const opts = { ...initOpts }
      opts.data = pdata

      const res = await get<HttpbinGetResponse<PostForm1>>(url, opts)
      assert(res && res.args, 'Should response.args not empty')
      assert(res.url === url + '?' + QueryString.stringify(pdata))
      assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
      assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
    })

    it('send nested key:value object data', async () => {
      const pdata: PDATA = { ...initData }
      const foo = Math.random().toString()
      pdata.p3 = {
        foo,
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await get<HttpbinGetResponse<typeof pdata>>(url, opts)
      const sendUrl = decodeURI(url + '?' + QueryString.stringify(pdata))

      try {
        assert(res && res.args, 'Should response.args not empty')
        assert(res.url === sendUrl, `Should get ${sendUrl}, but got ${res.url}`)
        assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
        assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
        assert(pdata.p3 && res.args['p3[foo]'] === foo, `Should got ${foo}`)
      }
      catch (ex) {
        assert(false, (ex as Error).message)
      }
    })
  })

})


describe(fileShortPath(import.meta.url), function() {
  this.retries(3)
  beforeEach(resolve => setTimeout(resolve, DELAY))

  describe('Should get() work with httpbin.org', () => {
    const url = HOST_GET
    const initOpts = {} as Options

    it('with dataType:"arrayBuffer"', async () => {
      const opts = { ...initOpts }
      opts.dataType = 'arrayBuffer'

      const buf = await get<ArrayBuffer>(url, opts)
      assert(buf && buf.byteLength > 0)

      const txt = buf.byteLength ? ab2str(buf) : ''
      assert(txt && txt.includes(url))
    })

    it.skip('with dataType:"blob"', (done) => {
      const opts = { ...initOpts }
      opts.dataType = 'blob'

      get<Blob>(url, opts)
        .then(
          (blob) => {
            const fr = new FileReader()

            assert(blob && blob.size > 0)

            fr.onloadend = () => {
              const buf = fr.result as ArrayBuffer
              assert(buf && buf.byteLength > 0)

              const txt = buf.byteLength ? ab2str(buf) : ''
              assert(txt && txt.includes(url))

              done()
            }
            fr.onerror = () => {
              assert(false, 'fr.readAsArrayBuffer(blob) throw error')
              done()
            }
            fr.readAsArrayBuffer(blob)

          },
          (ex) => {
            assert(false, (ex as Error).message)
            done()
          },
        )
    })

    it('with dataType:"raw"', async () => {
      const opts = { ...initOpts }
      opts.dataType = 'raw'

      const resp = await get<Response>(url, opts)
      const txt = await resp.text()
      assert(txt && txt.includes(url))
    })

    it('with dataType:"text"', async () => {
      const opts = { ...initOpts }
      opts.dataType = 'text'

      const txt = await get<string>(url, opts)
      assert(txt && txt.includes(url))
    })

    it('with dataType:"unknown" transferred to "json" automatically', async () => {
      const opts = { ...initOpts }
      // @ts-ignore
      opts.dataType = 'unknown'

      const res = await get<HttpbinGetResponse>(url, opts)
      assert(!! res, 'Should response not empty')
      assert(res.url === url)
    })
  })


  describe('Should get() dataType:"json" work with httpbin.org', () => {
    const url = HOST_GET
    const initData: PDATA = {
      p1: Math.random(),
      p2: Math.random().toString(),
    }
    const initOpts = {
      timeout: 20 * 1000,
      dataType: 'json',
    } as Options

    it('without query data', async () => {
      const opts = { ...initOpts }

      const res = await get<HttpbinGetResponse>(url, opts)
      assert(!! res, 'Should response not empty')
      assert(res.url === url)
    })

    it('with query data', async () => {
      const pdata = { ...initData }
      const opts = { ...initOpts }
      opts.data = pdata

      const res = await get<HttpbinGetResponse<PostForm1>>(url, opts)
      assert(res && res.args, 'Should response.args not empty')
      assert(res.url === url + '?' + QueryString.stringify(pdata))
      assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
      assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
    })

    it('send nested key:value object data', async () => {
      const pdata: PDATA = { ...initData }
      const foo = Math.random().toString()
      pdata.p3 = {
        foo,
      }
      const opts = { ...initOpts }
      opts.data = { ...pdata }

      const res = await get<HttpbinGetResponse<typeof pdata>>(url, opts)
      const sendUrl = decodeURI(url + '?' + QueryString.stringify(pdata))

      try {
        assert(res && res.args, 'Should response.args not empty')
        assert(res.url === sendUrl, `Should get ${sendUrl}, but got ${res.url}`)
        assert(res.args.p1 === pdata.p1.toString(), `Should got ${pdata.p1}`)
        assert(res.args.p2 === pdata.p2, `Should got ${pdata.p2}`)
        assert(pdata.p3 && res.args['p3[foo]'] === foo, `Should got ${foo}`)
      }
      catch (ex) {
        assert(false, (ex as Error).message)
      }
    })
  })

})
