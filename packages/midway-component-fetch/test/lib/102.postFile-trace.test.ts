import assert from 'node:assert'

import type { AssertsOptions } from '@mwcp/otel'
import {
  assertJaegerParentSpanArray,
  assertRootSpan,
  assertsSpan,
  retrieveTraceInfoFromRemote,
  sortSpans,
} from '@mwcp/otel'
import { fileShortPath } from '@waiting/shared-core'

import { FetchService } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'

import { imgBlob } from './100.data.js'
import type { UploadRet } from './100.types.js'


describe(fileShortPath(import.meta.url), () => {

  const path = `${apiBase.upload}/${apiMethod.hello}`

  it('postFile()', async () => {
    const { app, host } = testConfig
    const fetchService = await app.getApplicationContext().getAsync(FetchService)

    const url = `${host}${path.slice(1)}`
    const resp = await fetchService.postFile<UploadRet>(url, imgBlob)
    assert(resp)
    assert(resp.traceId)

    const [info] = await retrieveTraceInfoFromRemote(resp.traceId, 2)
    assert(info)
    const traceId = info.traceID
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
        'http.request.header.content_type': 'image/gif',
        'http.request.header.user_agent': 'undici',
        'http.route': path,
        'http.target': path,
        'span.kind': 'server',
      },
    }
    assertsSpan(span1, opt1)
  })


})


