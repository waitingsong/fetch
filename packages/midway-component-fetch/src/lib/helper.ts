/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  type Attributes,
  type DecoratorContext,
  type DecoratorTraceDataResp,
  AttrNames,
  HeadersKey,
  SemanticAttributes,
  propagateHeader,
} from '@mwcp/otel'
// eslint-disable-next-line import/no-extraneous-dependencies
import { propagation } from '@opentelemetry/api'
import { Headers, pickUrlStrFromRequestInfo } from '@waiting/fetch'
import { genISO8601String, retrieveHeadersItem } from '@waiting/shared-core'

import type { Config, ProcessExCallbackOptions, ReqCallbackOptions, RespCallbackOptions } from './types.js'


/**
 * Generate request header contains span and reqId if possible
 */
export const genRequestHeaders: Config['genRequestHeaders'] = (options, headersInit) => {

  const headers = new Headers(headersInit)

  const { webContext: ctx, traceContext, span } = options

  if (ctx?.requestContext) {
    if (typeof ctx.reqId === 'string' && ctx.reqId && ! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, ctx.reqId)
    }
  }

  if (! traceContext || ! span) {
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

export function traceLogBeforeRequest(
  options: ReqCallbackOptions,
  decoratorContext: DecoratorContext,
): DecoratorTraceDataResp {

  const { opts, config } = options
  const { traceSpan: span, traceContext } = decoratorContext

  if (traceContext) {
    const headers = new Headers(opts.headers)
    propagateHeader(traceContext, headers)
    opts.headers = headers
  }
  if (! span) { return }

  const time = genISO8601String()
  const url = pickUrlStrFromRequestInfo(opts.url)

  let events: Attributes = {}
  if (config.traceEvent) {
    events = {
      event: AttrNames.FetchStart,
      url,
      method: opts.method,
      time,
    }
  }

  const attrs = genOutgoingRequestAttributes(options) ?? {}
  return { attrs, events }
}


export function traceLogAfterResponse(options: RespCallbackOptions): DecoratorTraceDataResp {
  const {
    config,
    opts,
    respHeaders,
  } = options

  const { traceResponseData, captureResponseHeaders } = options.config

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

  const url = pickUrlStrFromRequestInfo(opts.url)

  let events: Attributes = {}
  if (config.traceEvent) {
    const time = genISO8601String()
    events = {
      event: AttrNames.FetchFinish,
      url,
      method: opts.method,
      time,
    }
    // otelComponent.addEvent(span, events)
  }

  return { attrs: tags, events }

  // traceContext && propagateOutgoingHeader(traceContext, ctx.res)
}

export function genAttrsWhileError(options: ProcessExCallbackOptions): DecoratorTraceDataResp {
  if (! options.config.enableTrace) { return }

  const { opts, exception } = options

  const { captureResponseHeaders } = options.config
  // const time = genISO8601String()
  // const url = pickUrlStrFromRequestInfo(opts.url)
  // const parentInput: Attributes = {
  //   event: AttrNames.FetchException,
  //   url,
  //   method: opts.method,
  //   time,
  // }
  // // otelComponent.addEvent(span, parentInput) // parent span log
  // ret.rootEvents = parentInput

  const events: Attributes = {
    [AttrNames.LogLevel]: 'error',
    level: 'error',
    event: AttrNames.FetchException,
    time: genISO8601String(),
    'err.msg': exception.message,
    'err.stack': exception.stack,
  }
  if (Array.isArray(captureResponseHeaders)) {
    captureResponseHeaders.forEach((name) => {
      // @ts-expect-error for undici types
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        events[`http.${name}`] = val
      }
    })
  }

  return { events }
}



/**
 * Returns outgoing request attributes
 */
export function genOutgoingRequestAttributes(options: ReqCallbackOptions): Attributes | undefined {

  const { opts } = options

  const {
    traceRequestBody: enableTraceLoggingReqBody,
    captureRequestHeaders,
  } = options.config

  const url = pickUrlStrFromRequestInfo(opts.url)
  const tags: Attributes = {
    [SemanticAttributes.HTTP_METHOD]: opts.method,
    [SemanticAttributes.HTTP_URL]: url,
  }

  if (enableTraceLoggingReqBody && typeof opts.data !== 'undefined') {
    tags[AttrNames.Http_Request_Query] = JSON.stringify(opts.data, null, 2)
  }

  if (Array.isArray(captureRequestHeaders)) {
    captureRequestHeaders.forEach((name) => {
      // @ts-expect-error for undici types
      const val = retrieveHeadersItem(opts.headers, name)
      if (val) {
        tags[`http.${name}`] = val
      }
    })
  }

  return tags
}
