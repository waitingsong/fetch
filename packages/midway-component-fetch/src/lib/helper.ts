/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  Attributes,
  AttrNames,
  HeadersKey,
  SemanticAttributes,
  SpanStatusCode,
} from '@mwcp/otel'
import { propagation } from '@opentelemetry/api'
import { Node_Headers } from '@waiting/fetch'
import {
  genISO8601String,
  retrieveHeadersItem,
} from '@waiting/shared-core'

import { Config, ReqCallbackOptions } from './types'


/**
 * Generate request header contains span and reqId if possible
 */
export const genRequestHeaders: Config['genRequestHeaders'] = async (ctx, headersInit, traceSvc, span, traceContext) => {
  const headers = new Node_Headers(headersInit)

  if (! ctx?.requestContext) {
    return headers
  }

  if (typeof ctx['reqId'] === 'string' && ctx['reqId'] && ! headers.has(HeadersKey.reqId)) {
    headers.set(HeadersKey.reqId, ctx['reqId'])
  }

  if (! traceSvc || ! span || ! traceContext) {
    return headers
  }

  if (! headers.has(HeadersKey.otelTraceId)) {
    const tmp = {}
    propagation.inject(traceContext, tmp)
    Object.entries(tmp).forEach(([key, val]) => {
      if (typeof val === 'string') {
        headers.set(key, val)
      }
      else if (typeof val === 'number') {
        headers.set(key, val.toString())
      }
      else if (Array.isArray(val)) {
        val.forEach((vv) => {
          headers.set(key, String(vv))
        })
      }
    })
  }

  return headers
}

const beforeRequest: Config['beforeRequest'] = async (options) => {
  const { opts, ctx, traceService, config } = options
  const { span } = opts

  if (! ctx?.requestContext) { return }

  if (! traceService || ! span) { return }

  const time = genISO8601String()

  if (config.traceEvent) {
    const currInput: Attributes = {
      event: AttrNames.FetchStart,
      url: opts.url,
      method: opts.method,
      time,
    }
    traceService.addEvent(span, currInput)
  }

  const attrs = genOutgoingRequestAttributes(options)
  attrs && traceService.setAttributes(span, attrs)

}

const afterResponse: Config['afterResponse'] = async (options) => {
  const {
    config,
    opts,
    // resultData,
    respHeaders,
    ctx,
    traceService,
  } = options

  if (! ctx?.requestContext) { return }

  if (! traceService) {
    return
  }
  const { span } = opts
  if (! span) { return }

  const {
    traceResponseData,
    captureResponseHeaders,
  } = options.config

  const tags: Attributes = {}
  if (traceResponseData) {
    tags[AttrNames.Http_Response_Body] = JSON.stringify(options.resultData, null, 2)
  }

  if (respHeaders && Array.isArray(captureResponseHeaders)) {
    captureResponseHeaders.forEach((name) => {
      const val = retrieveHeadersItem(respHeaders, name)
      if (val) {
        tags[`http.resp.${name}`] = val
      }
    })
  }

  if (Object.keys(tags).length) {
    traceService.setAttributes(span, tags)
  }

  if (config.traceEvent) {
    const time = genISO8601String()
    const attrs: Attributes = {
      event: AttrNames.FetchFinish,
      url: opts.url,
      method: opts.method,
      time,
    }
    traceService.addEvent(span, attrs)
  }

  // traceContext && propagateOutgoingHeader(traceContext, ctx.res)
  traceService.endSpan(span)
}

export const processEx: Config['processEx'] = async (options) => {
  const { opts, exception, ctx, traceService } = options

  if (! ctx?.requestContext) {
    throw exception
  }

  if (! traceService) {
    throw exception
  }

  const { span } = opts
  if (! span) {
    throw exception
  }

  const {
    captureResponseHeaders,
  } = options.config
  const time = genISO8601String()
  // const mem = humanMemoryUsage()

  const parentInput: Attributes = {
    event: AttrNames.FetchException,
    url: opts.url,
    method: opts.method,
    time,
    // [TracerLog.svcMemoryUsage]: mem,
  }
  traceService.addEvent(span, parentInput) // parent span log

  const attrs: Attributes = {
    // [AttrNames.error]: true,
    [AttrNames.LogLevel]: 'error',
    // [AttrNames.svcException]: exception.message,
  }

  if (Array.isArray(captureResponseHeaders)) {
    captureResponseHeaders.forEach((name) => {
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        attrs[`http.${name}`] = val
      }
    })
  }
  traceService.addEvent(span, attrs)

  const input: Attributes = {
    level: 'error',
    event: AttrNames.FetchException,
    time: genISO8601String(),
    'err.msg': exception.message,
    'err.stack': exception.stack,
    // [TracerLog.svcMemoryUsage]: mem,
  }
  traceService.addEvent(span, input)

  traceService.endSpan(span, {
    code: SpanStatusCode.ERROR,
    error: exception,
  })

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


/**
 * Returns outgoing request attributes
 */
export function genOutgoingRequestAttributes(
  options: ReqCallbackOptions,
): Attributes | undefined {

  const { opts, ctx, traceService } = options
  const { span } = opts

  if (! ctx?.requestContext) { return }

  if (! traceService || ! span) { return }

  const {
    traceRequestBody: enableTraceLoggingReqBody,
    captureRequestHeaders,
  } = options.config

  const tags: Attributes = {
    [SemanticAttributes.HTTP_METHOD]: opts.method,
    [SemanticAttributes.HTTP_URL]: opts.url,
  }

  if (enableTraceLoggingReqBody && typeof opts.data !== 'undefined') {
    tags[AttrNames.Http_Request_Query] = JSON.stringify(opts.data, null, 2)
  }

  if (Array.isArray(captureRequestHeaders)) {
    captureRequestHeaders.forEach((name) => {
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        tags[`http.${name}`] = val
      }
    })
  }

  return tags
}
