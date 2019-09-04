import * as QueryString from 'qs'
import { defer, of, throwError, Observable } from 'rxjs'
import { catchError, concatMap, timeout } from 'rxjs/operators'

import { Args } from './model'
import { parseRespCookie } from './response'
import { buildQueryString, parseInitOpts, selectFecthModule } from './util'


/**
 * fetch wrapper
 *
 * parameter init ignored during parameter input is typeof Request
 */
export function _fetch(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
): Observable<Response> {

  /* istanbul ignore else */
  if (! input) {
    throwError(new TypeError('value of input invalid'))
  }

  let req$ = createObbRequest(input, args, requestInit)
  req$ = parseRequestStream(req$, args)

  return req$.pipe(
    concatMap(res => handleRedirect(res, args, requestInit)),
  )
}


/** Create Observable Request */
export function createObbRequest(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
): Observable<Response> {

  let inputNew = input
  const fetchModule = selectFecthModule(args.fetchModule)

  if (typeof input === 'string') {
    /* istanbul ignore else */
    if (typeof args.data !== 'undefined') {
      if (args.processData) {
        if (['GET', 'DELETE'].includes(requestInit.method as string)) {
          inputNew = buildQueryString(input, args.data)
        }
        else {
          requestInit.body = QueryString.stringify(args.data)
        }
      }
      else {
        requestInit.body = args.data as RequestInit['body']
      }
    }

    return defer(() => fetchModule(inputNew, requestInit))
  }
  else {
    return defer(() => fetchModule(input))
  }
}


export function parseRequestStream(
  request$: Observable<Response>,
  args: Args,
): Observable<Response> {

  const req$ = parseTimeout(request$, args.timeout, args.abortController)
  return req$
}


function parseTimeout(
  request$: Observable<Response>,
  timeoutValue: Args['timeout'],
  abortController: Args['abortController'],
): Observable<Response> {

  let ret$ = request$

  /* istanbul ignore else */
  if (typeof timeoutValue === 'number' && timeoutValue >= 0) {
    ret$ = request$.pipe(
      timeout(timeoutValue),
      catchError((err) => {
        // test by test_browser/30_abort.test.ts
        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (abortController && typeof abortController.abort === 'function' && ! abortController.signal.aborted) {
          abortController.abort()
        }
        throw err
      }),
    )
  }

  return ret$
}


/**
 * Handle redirect case to retrieve cookies before jumping under Node.js.
 * There's no effect under Browser
 *
 * docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export function handleRedirect(resp: Response, args: Args, init: RequestInit): Observable<Response> {
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
      const options = parseInitOpts({ args, requestInit: init })

      if (resp.status === 303) {
        options.requestInit.method = 'GET'
        return _fetch(url, options.args, options.requestInit)
      }
      else {
        return _fetch(url, options.args, options.requestInit)
      }
    }
  }
  else {
    throwError('Redirect location is empty')
  }

  return of(resp)
}
