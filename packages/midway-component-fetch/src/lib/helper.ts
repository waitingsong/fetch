import {
  SpanLogInput,
  TracerLog,
  TracerTag,
  HeadersKey,
  SpanHeaderInit,
  TracerManager,
} from '@mw-components/jaeger'
import { Node_Headers } from '@waiting/fetch'
import {
  genISO8601String,
  humanMemoryUsage,
  retrieveHeadersItem,
} from '@waiting/shared-core'
import { Tags } from 'opentracing'

import { Config } from './types'


/**
 * Generate request header contains span and reqId if possible
 */
export const genRequestHeaders: Config['genRequestHeaders'] = async (ctx, headersInit, span) => {
  const ret = new Node_Headers(headersInit)

  if (! ctx || ! ctx.requestContext) {
    return ret
  }
  const tracerManager = await ctx.requestContext.getAsync(TracerManager)
  if (! tracerManager) {
    return ret
  }

  // if (! ret.has(HeadersKey.traceId)) {
  //   // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  //   const spanHeader: SpanHeaderInit | undefined = ctx.tracerManager && span
  //     ? ctx.tracerManager.headerOfCurrentSpan(span)
  //     : void 0
  //   if (spanHeader) {
  //     ret.set(HeadersKey.traceId, spanHeader[HeadersKey.traceId])
  //   }
  // }

  // override traceId
  if (span) {
    const spanHeader: SpanHeaderInit | undefined = tracerManager.headerOfCurrentSpan(span)
    if (spanHeader) {
      ret.set(HeadersKey.traceId, spanHeader[HeadersKey.traceId])
    }
  }

  if (typeof ctx['reqId'] === 'string' && ctx['reqId'] && ! ret.has(HeadersKey.reqId)) {
    ret.set(HeadersKey.reqId, ctx['reqId'])
  }

  return ret
}

const beforeRequest: Config['beforeRequest'] = async (options) => {
  const { id, fetchRequestSpanMap, opts } = options
  const { ctx, span: pSpan } = opts

  if (! ctx || ! ctx.requestContext) { return }
  // if (! pSpan) { return }

  const tracerManager = await ctx.requestContext.getAsync(TracerManager)
  if (! tracerManager) {
    return
  }

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
  tracerManager.spanLog(parentInput) // parent span log

  const span = pSpan
    ? pSpan
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

const afterResponse: Config['afterResponse'] = async (options) => {
  const { id, fetchRequestSpanMap, opts, resultData } = options
  const { ctx } = opts
  if (! ctx || ! ctx.requestContext) { return }

  const span = fetchRequestSpanMap.get(id)
  const tracerManager = await ctx.requestContext.getAsync(TracerManager)
  if (! tracerManager) {
    return
  }
  if (! span) { return }

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
  if (tracerManager) {
    tracerManager.spanLog(parentInput)
  }

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

export const processEx: Config['processEx'] = async (options) => {
  const { id, fetchRequestSpanMap, opts, exception } = options
  const { ctx } = opts
  if (! ctx || ! ctx.requestContext) {
    throw exception
  }
  const span = fetchRequestSpanMap.get(id)

  const tracerManager = await ctx.requestContext.getAsync(TracerManager)
  if (! tracerManager) {
    throw exception
  }

  if (! span) {
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
  tracerManager.spanLog(parentInput) // parent span log

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
    time: genISO8601String(),
    'err.msg': exception.message,
    'err.stack': exception.stack,
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
  beforeRequest,
  afterResponse,
  processEx,
}

