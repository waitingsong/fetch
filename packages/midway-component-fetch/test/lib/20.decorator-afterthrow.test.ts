import assert from 'node:assert/strict'

import type { AssertsOptions } from '@mwcp/otel'
import {
  AttrNames,
  assertJaegerParentSpanArray,
  assertRootSpan,
  assertsSpan,
  retrieveTraceInfoFromRemote,
  retrieveTraceparentFromHeader,
  sortSpans,
} from '@mwcp/otel'
import { SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  it('Should work', async () => {
    const { httpRequest, app } = testConfig

    const path = `${apiBase.fetch}/${apiMethod.after_throw}`
    const resp = await httpRequest.get(path)
    assert(! resp.ok, resp.text)

    const traceparent = retrieveTraceparentFromHeader(resp.header as Headers)
    assert(traceparent)

    const [info] = await retrieveTraceInfoFromRemote(traceparent.traceId, 2)
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
      operationName: `HTTP GET ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: '/fetch/after_throw',
        [SEMATTRS_HTTP_ROUTE]: '/fetch/after_throw',
        [AttrNames.HTTP_ERROR_NAME]: 'TypeError',
        [AttrNames.HTTP_ERROR_MESSAGE]: 'fetch failed',
        [AttrNames.otel_status_code]: 'ERROR',
        error: true,
      },
      logs: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'HTTP GET localhost:9999/',
      tags: {
        'caller.class': 'FetchComponent',
        'caller.method': 'fetch2',
        'span.kind': 'client',
        [AttrNames.HTTP_ERROR_NAME]: 'TypeError',
        [AttrNames.HTTP_ERROR_MESSAGE]: 'fetch failed',
        [AttrNames.otel_status_code]: 'ERROR',
        error: true,
      },
      logs: [
        { event: 'fetch.start', method: 'GET', url: 'http://localhost:9999' },
        { event: 'prepare-request-data' },
        { event: 'request-start' },
        { event: 'fetch.exception', 'err.msg': 'fetch failed', level: 'error', 'log.level': 'error' },
      ],
    }
    assertsSpan(span1, opt1)

  })

})

