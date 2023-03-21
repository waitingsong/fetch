import assert from 'assert'

import type { Span } from '@opentelemetry/api'
import {
  Response,
  RequestInit,
  RequestInfo,
  fetch,
} from 'undici'

import { trace } from './trace.js'
import { Args, AttributeKey } from './types.js'
import {
  processInitOpts,
  processRequestGetLikeData,
  processRequestPostLikeData,
  parseRespCookie,
} from './util.js'


/**
 * fetch wrapper
 *
 * parameter init ignored during parameter input is typeof Request
 */
export async function _fetch(
  input: RequestInfo,
  args: Args,
  requestInit: RequestInit,
  span?: Span | undefined,
): Promise<Response> {

  const resp = await createRequest(input, args, requestInit, span)
  const res = await handleRedirect(resp, args, requestInit)
  trace(AttributeKey.HandleRedirectFinish, span)
  return res
}


export async function createRequest(
  input: RequestInfo,
  args: Args,
  requestInit: RequestInit,
  span?: Span | undefined,
): Promise<Response> {

  let inputNew = input
  const fetchModule = fetch
  let resp: Response

  if (typeof input === 'string') {
    trace(AttributeKey.ProcessRequestData)
    assert(input, 'input should not be empty when typeof input is string')

    if (['GET', 'DELETE'].includes(requestInit.method as string)) {
      inputNew = processRequestGetLikeData(input, args)
    }
    else if (['POST', 'PUT', 'OPTIONS'].includes(requestInit.method as string)) {
      const body = processRequestPostLikeData(args) ?? null
      requestInit.body = body
    }
    else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new TypeError(`Invalid method value: "${requestInit.method}"`)
    }

    // fix undici not support referrer value 'client' and 'no-referrer'
    const { referrer } = requestInit
    if (! referrer || referrer === 'client' || referrer === 'no-referrer') {
      // @ts-expect-error
      requestInit.referrer = void 0
    }

    // @ts-expect-error
    if (requestInit.url) {
      // @ts-expect-error
      delete requestInit.url
    }

    trace(AttributeKey.RequestStart, span)
    resp = await fetchModule(inputNew, requestInit)
  }
  else {
    trace(AttributeKey.RequestStart, span)
    resp = await fetchModule(input)
  }

  trace(AttributeKey.RequestFinish, span)
  return resp
}


/**
 * Handle redirect case to retrieve cookies before jumping under Node.js.
 * There's no effect under Browser
 *
 * docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export async function handleRedirect(
  resp: Response,
  args: Args,
  init: RequestInit,
): Promise<Response> {

  // test by test/30_cookie.test.ts
  if (args.keepRedirectCookies === true && resp.status >= 301 && resp.status <= 308) {
    // do NOT use resp.url, it's the final url
    const location = resp.headers.get('location')

    if (! location) {
      return resp
    }

    const url = location.toLocaleLowerCase().startsWith('http')
      ? location
      : new URL(location, resp.url).toString()

    if (url) {
      const cookie = resp.headers.get('Set-Cookie')
      const cookieObj = parseRespCookie(cookie)
      if (cookieObj) {
        args.cookies = args.cookies
          ? { ...args.cookies, ...cookieObj }
          : { ...cookieObj }
      }
      const options = processInitOpts({ args, requestInit: init })

      if (resp.status === 303) {
        options.requestInit.method = 'GET'
        return _fetch(url, options.args, options.requestInit)
      }
      else {
        return _fetch(url, options.args, options.requestInit)
      }
    }
  }

  return resp
}
