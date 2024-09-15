import assert from 'node:assert'
import { Blob as NodeBlob } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { UploadFileInfo } from '@midwayjs/busboy'
import type { AssertsOptions } from '@mwcp/otel'
import {
  AttrNames,
  assertsSpan,
  assertRootSpan,
  retrieveTraceInfoFromRemote,
  retrieveTraceparentFromHeader,
  sortSpans,
  assertJaegerParentSpanArray,
} from '@mwcp/otel'
import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { FormData, FetchService } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const currDir = genCurrentDirname(import.meta.url)

const fileName = 'loading-1.gif'
const fileType = 'image/gif'
const imgPath = join(currDir, '../images', fileName)
const buf = await readFile(imgPath)
const blob = typeof Blob === 'undefined'
  ? new NodeBlob([buf], { type: fileType })
  : new Blob([buf], { type: fileType })
// const base64 = buf.toString('base64')

describe(fileShortPath(import.meta.url), () => {

  const path = `${apiBase.upload}/${apiMethod.hello}`

  const formData = new FormData()
  const rndStr = Math.random().toString(36).slice(2)
  formData.append('name', rndStr)
  formData.append('uploadFile', blob, 'loading-1.gif')

  it('postFormWithFile() trace', async () => {
    const { app, host } = testConfig
    const fetchService = await app.getApplicationContext().getAsync(FetchService)

    const url = `${host}${path.slice(1)}`
    const resp = await fetchService.postFormWithFile<UploadRet>(url, formData)
    assert(resp)
    assert(resp.traceId)

    const [info] = await retrieveTraceInfoFromRemote(resp.traceId, 2)
    assert(info)
    const traceId = info.traceID
    console.log('--------------------', { info })
    const { spans } = info
    const [rootSpan, span1] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)

    assertJaegerParentSpanArray([
      { parentSpan: rootSpan, childSpan: span1 },
    ])

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP POST ${url.slice(7)}`,
      mergeDefaultLogs: false,
      mergeDefaultTags: false,
      tags: {
        'caller.class': 'FetchComponent',
        'caller.method': 'fetch2',
        'http.method': 'POST',
        // 'http.resp.Content-Length': '227',
        'http.resp.content-type': 'application/json; charset=utf-8',
        'http.url': url,
        'span.kind': 'client',
      },
      logs: [
        { event: 'fetch.start', method: 'POST', url },
        { event: 'prepare-request-data' },
        { event: 'request-start' },
        { event: 'request-finish' },
        { event: 'handle-redirect-finish' },
        { event: 'process-response-start' },
        { event: 'process-response-finish' },
        { event: 'fetch.finish', method: 'POST', url },
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: `HTTP POST ${path}`,
      tags: {
        'http.method': 'POST',
        'http.request.header.content_type': /^multipart\/form-data;\s+boundary=/u,
        'http.request.header.user_agent': 'undici',
        'http.route': path,
        'http.target': path,
        'span.kind': 'server',
      },
    }
    assertsSpan(span1, opt1)
  })


})


interface UploadRet {
  fields: Record<string, string>
  files: UploadFileInfo[]
  traceId: string
}
