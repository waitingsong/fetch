import { Args } from './types'
import {
  processInitOpts,
  processRequestGetLikeData,
  processRequestPostLikeData,
  parseRespCookie,
  selectFecthModule,
} from './util'


/**
 * fetch wrapper
 *
 * parameter init ignored during parameter input is typeof Request
 */
export function _fetch(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
): Promise<Response> {

  const req = createRequest(input, args, requestInit)
  const res = req.then(resp => handleRedirect(resp, args, requestInit))
  return res
}


export function createRequest(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
): Promise<Response> {

  let inputNew = input
  const fetchModule = selectFecthModule(args.fetchModule)

  if (typeof input === 'string') {

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

    return fetchModule(inputNew, requestInit)
  }
  else {
    return fetchModule(input)
  }
}


/**
 * Handle redirect case to retrieve cookies before jumping under Node.js.
 * There's no effect under Browser
 *
 * docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export function handleRedirect(
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

  return Promise.resolve(resp)
}
