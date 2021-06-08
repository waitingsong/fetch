/* eslint-disable import/no-extraneous-dependencies */
import { Node_Headers } from '@waiting/fetch'
import { genISO8601String, humanMemoryUsage } from '@waiting/shared-core'
import { SpanLogInput, TracerLog, TracerTag, HeadersKey } from 'midway-component-jaeger'
import { Tags } from 'opentracing'

import { FetchComponentConfig } from './types'


export const genRequestHeaders: FetchComponentConfig['genRequestHeaders'] = (ctx, headersInit, span) => {
  const spanHeader = ctx.tracerManager.headerOfCurrentSpan(span)
  const newHeadersInit = {
    ...headersInit,
    ...spanHeader,
    [HeadersKey.reqId]: ctx.reqId as string,
  } as HeadersInit

  const headers = new Node_Headers(newHeadersInit)
  return headers
}

const beforeRequest: FetchComponentConfig['beforeRequest'] = async (options) => {
  const { id, ctx, isTraceLoggingReqBody, opts } = options
  const input: SpanLogInput = {
    event: TracerLog.fetchStart,
    url: opts.url,
    method: opts.method,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  }
  ctx.tracerManager.spanLog(input)

  const { tracerManager, fetchRequestSpanMap } = ctx
  const span = tracerManager.genSpan('FetchComponent')
  const tags: SpanLogInput = {
    [Tags.HTTP_URL]: opts.url,
    [Tags.HTTP_METHOD]: opts.method,
  }
  if (isTraceLoggingReqBody) {
    if (typeof opts.data !== 'undefined') {
      tags[TracerTag.respBody] = opts.data
    }
  }
  else {
    tags[TracerTag.respBody] = 'Not logged'
  }

  span.addTags(tags)
  span.log(input)
  fetchRequestSpanMap.set(id, span)
}

const afterResponse: FetchComponentConfig['afterResponse'] = async (options) => {
  const { id, ctx, isTraceLoggingRespData, opts, resultData } = options
  const input: SpanLogInput = {
    event: TracerLog.fetchFinish,
    url: opts.url,
    method: opts.method,
    time: genISO8601String(),
    [TracerLog.svcMemoryUsage]: humanMemoryUsage(),
  }
  ctx.tracerManager.spanLog(input)

  const { fetchRequestSpanMap } = ctx
  const span = fetchRequestSpanMap.get(id)
  if (! span) {
    return
  }
  const tags: SpanLogInput = {}
  if (isTraceLoggingRespData) {
    if (typeof resultData !== 'undefined') {
      tags[TracerTag.respBody] = resultData
    }
  }
  else {
    tags[TracerTag.respBody] = 'Not logged'
  }

  Object.keys(tags).length && span.addTags(tags)
  span.log(input)
  span.finish()
  fetchRequestSpanMap.delete(id)
}

export const defaultfetchConfigCallbacks = {
  // genRequestHeaders,
  beforeRequest,
  afterResponse,
}

