/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable import/no-extraneous-dependencies */
import { SpanLogInput, TracerLog, TracerTag, HeadersKey, SpanHeaderInit } from '@mw-components/jaeger'
import { Node_Headers } from '@waiting/fetch'
import {
  genISO8601String,
  humanMemoryUsage,
  retrieveHeadersItem,
} from '@waiting/shared-core'
import { Tags } from 'opentracing'

import { FetchComponentConfig } from './types'


/**
 * Generate request header contains span and reqId if possible
 */
export const genRequestHeaders: FetchComponentConfig['genRequestHeaders'] = (ctx, headersInit, span) => {
  const ret = new Node_Headers(headersInit)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! ctx) {
    return ret
  }

  if (! ret.has(HeadersKey.traceId)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const spanHeader: SpanHeaderInit | undefined = ctx.tracerManager && span
      ? ctx.tracerManager.headerOfCurrentSpan(span)
      : void 0
    if (spanHeader) {
      ret.set(HeadersKey.traceId, spanHeader[HeadersKey.traceId])
    }
  }

  if (ctx.reqId && ! ret.has(HeadersKey.reqId)) {
    ret.set(HeadersKey.reqId, ctx.reqId)
  }

  return ret
}

const beforeRequest: FetchComponentConfig['beforeRequest'] = async (options) => {
  const { id, ctx, fetchRequestSpanMap, opts } = options

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! ctx || ! ctx.tracerManager) { return }

  const {
    enableTraceLoggingReqBody,
    traceLoggingReqHeaders,
  } = options.config

  const time = genISO8601String()
  const mem = humanMemoryUsage()
  const parentInput: SpanLogInput = {
    event: TracerLog.fetchStart,
    url: opts.url,
    method: opts.method,
    time,
    [TracerLog.svcMemoryUsage]: mem,
  }
  ctx.tracerManager.spanLog(parentInput) // parent span log

  const { tracerManager } = ctx
  const span = opts.span
    ? opts.span
    : tracerManager.genSpan('FetchComponent')
  opts.span = span

  const tags: SpanLogInput = {
    [Tags.HTTP_URL]: opts.url,
    [Tags.HTTP_METHOD]: opts.method,
  }

  if (enableTraceLoggingReqBody) {
    if (typeof opts.data !== 'undefined') {
      tags[TracerTag.reqQuery] = opts.data
    }
  }
  else {
    tags[TracerTag.reqQuery] = 'Not logged'
  }

  if (Array.isArray(traceLoggingReqHeaders)) {
    traceLoggingReqHeaders.forEach((name) => {
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        tags[`http.${name}`] = val
      }
    })
  }

  span.addTags(tags)

  const input: SpanLogInput = {
    event: TracerLog.fetchStart,
    time,
    [TracerLog.svcMemoryUsage]: mem,
  }
  span.log(input) // current span log
  fetchRequestSpanMap.set(id, span)
}

const afterResponse: FetchComponentConfig['afterResponse'] = async (options) => {
  const { id, ctx, fetchRequestSpanMap, opts, resultData } = options

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! ctx.tracerManager) { return }

  const {
    enableTraceLoggingRespData,
    traceLoggingRespHeaders,
  } = options.config

  const time = genISO8601String()
  const mem = humanMemoryUsage()
  const parentInput: SpanLogInput = {
    event: TracerLog.fetchFinish,
    url: opts.url,
    method: opts.method,
    time,
    [TracerLog.svcMemoryUsage]: mem,
  }
  ctx.tracerManager.spanLog(parentInput)

  const span = fetchRequestSpanMap.get(id)
  if (! span) {
    return
  }
  const tags: SpanLogInput = {}
  if (enableTraceLoggingRespData) {
    if (typeof resultData !== 'undefined') {
      tags[TracerTag.respBody] = resultData
    }
  }
  else {
    tags[TracerTag.respBody] = 'Not logged'
  }

  if (Array.isArray(traceLoggingRespHeaders)) {
    traceLoggingRespHeaders.forEach((name) => {
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        tags[`http.${name}`] = val
      }
    })
  }

  Object.keys(tags).length && span.addTags(tags)

  const input: SpanLogInput = {
    event: TracerLog.fetchFinish,
    time,
    [TracerLog.svcMemoryUsage]: mem,
  }
  span.log(input)

  span.finish()
  fetchRequestSpanMap.delete(id)
}

export const processEx: FetchComponentConfig['processEx'] = (options) => {
  const { id, ctx, fetchRequestSpanMap, opts, exception } = options

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! ctx || ! ctx.tracerManager) {
    throw exception
  }

  const {
    traceLoggingRespHeaders,
  } = options.config
  const time = genISO8601String()
  const mem = humanMemoryUsage()

  const parentInput: SpanLogInput = {
    event: TracerLog.fetchException,
    url: opts.url,
    method: opts.method,
    time,
    [TracerLog.svcMemoryUsage]: mem,
  }
  ctx.tracerManager.spanLog(parentInput) // parent span log

  const span = fetchRequestSpanMap.get(id)
  if (! span) {
    if (exception instanceof Error) {
      throw exception
    }
    else {
      throw new Error(exception)
    }
  }

  const tags: SpanLogInput = {
    [Tags.ERROR]: true,
    [TracerTag.logLevel]: 'error',
    [TracerTag.svcException]: exception,
  }

  if (Array.isArray(traceLoggingRespHeaders)) {
    traceLoggingRespHeaders.forEach((name) => {
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        tags[`http.${name}`] = val
      }
    })
  }

  span.addTags(tags)

  const input: SpanLogInput = {
    level: 'error',
    event: TracerLog.fetchException,
    time,
    [TracerLog.svcMemoryUsage]: mem,
  }
  span.log(input)

  span.finish()
  fetchRequestSpanMap.delete(id)

  if (exception instanceof Error) {
    throw exception
  }
  else {
    throw new Error(exception)
  }
}

export const defaultfetchConfigCallbacks = {
  // genRequestHeaders,
  beforeRequest,
  afterResponse,
  processEx,
}

