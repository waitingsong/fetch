import type { Span } from 'opentracing'

import { traceLog } from './tracer.js'
import { Args } from './types.js'
import {
  processInitOpts,
  processRequestGetLikeData,
  processRequestPostLikeData,
  parseRespCookie,
  selectFecthModule,
} from './util.js'


/**
 * fetch wrapper
 *
 * parameter init ignored during parameter input is typeof Request
 */
export async function _fetch(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
  span?: Span | undefined,
): Promise<Response> {

  const resp = await createRequest(input, args, requestInit, span)
  const res = await handleRedirect(resp, args, requestInit)
  traceLog('handleRedirect-finish', span)
  return res
}


export async function createRequest(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
  span?: Span | undefined,
): Promise<Response> {

  let inputNew = input
  const fetchModule = selectFecthModule(args.fetchModule)
  let resp: Response

  if (typeof input === 'string') {
    traceLog('request-processRequestData', span)

    if (['GET', 'DELETE'].includes(requestInit.method as string)) {
      inputNew = processRequestGetLikeData(input, args)
    }
    else if (['POST', 'PUT', 'OPTIONS'].includes(requestInit.method as string)) {
      const body: NonNullable<RequestInit['body']> | undefined = processRequestPostLikeData(args)
      if (typeof body !== 'undefined') {
        requestInit.body = body
      }
    }
    else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new TypeError(`Invalid method value: "${requestInit.method}"`)
    }

    traceLog('request-start', span)
    resp = await fetchModule(inputNew, requestInit)
  }
  else {
    traceLog('request-start', span)
    resp = await fetchModule(input)
  }

  traceLog('request-finish', span)
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
  /* istanbul ignore next */
  if (args.keepRedirectCookies === true && resp.status >= 301 && resp.status <= 308) {
    const url = resp.headers.get('location')
    const cookie = resp.headers.get('Set-Cookie')

    /* istanbul ignore if */
    if (url) {
      const cookieObj = parseRespCookie(cookie)
      /* istanbul ignore else */
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
