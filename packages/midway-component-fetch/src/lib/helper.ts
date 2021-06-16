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
  const {
    id,
    ctx,
    opts,
  } = options
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
  const {
    id,
    ctx,
    opts,
    resultData,
  } = options
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

export function retrieveHeadersItem(
  headers: HeadersInit | undefined,
  name: string,
): string | null | undefined {

  if (! headers) {
    return ''
  }

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name)
  }
  else if (Array.isArray(headers)) {
    console.warn('Not supported param type Array, only support Record or Headers Map')
  }
  else if (typeof headers === 'object' && Object.keys(headers).length) {
    // @ts-expect-error
    return headers[name] as string | undefined
  }

  return ''
}


