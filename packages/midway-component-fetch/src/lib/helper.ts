/* eslint-disable import/no-extraneous-dependencies */
import { SpanLogInput, TracerLog, TracerTag, HeadersKey } from '@mw-components/jaeger'
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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const spanHeader = ctx.tracerManager
    ? ctx.tracerManager.headerOfCurrentSpan(span)
    : void 0
  const newHeadersInit = {
    ...headersInit,
    ...spanHeader,
    [HeadersKey.reqId]: ctx.reqId as string,
  } as HeadersInit

  const headers = new Node_Headers(newHeadersInit)
  return headers
}

const beforeRequest: FetchComponentConfig['beforeRequest'] = async (options) => {
  const { id, ctx, opts } = options

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! ctx.tracerManager) { return }

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

  const { tracerManager, fetchRequestSpanMap } = ctx
  const span = tracerManager.genSpan('FetchComponent')
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
  const { id, ctx, opts, resultData } = options

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

  const { fetchRequestSpanMap } = ctx
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
  const { id, ctx, opts, exception } = options

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! ctx.tracerManager) {
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

  const { fetchRequestSpanMap } = ctx
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

