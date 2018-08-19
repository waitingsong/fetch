import { defer, of, throwError, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { httpErrorMsgPrefix } from './config'
import { Args, ObbRetType, RxRequestInit } from './model'
import { _fetch } from './request'
import { assertNever } from './shared'
import { parseInitOpts } from './util'


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
    if (! url) {
      throwError('Redirect location is empty')
    }
    else {
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
  return of(resp)
}


export function handleResponseError(resp: Response): Observable<Response> {
  /* istanbul ignore else */
  if (resp.ok) {
    return of(resp)
  }
  const status = resp.status

  return defer(() => resp.text()).pipe(
    catchError((err: Error) => of(err ? err.toString() : 'unknow error')),
    map((txt: string) => {
      throw new Error(`${ httpErrorMsgPrefix }${ status }\nResponse: ` + txt)
    }),
  )
}


export function parseResponseType(response: Response, dataType: RxRequestInit['dataType']): Observable<ObbRetType> {
  /* istanbul ignore else  */
  if (dataType) {
    switch (dataType) {
      case 'arrayBuffer':
        return defer(() => response.arrayBuffer())

      case 'blob':
        return defer(() => response.blob())

      case 'formData':
        return defer(() => response.formData())

      case 'json':
        return <Observable<object>> defer(() => response.json())

      case 'raw':
        return of(response)

      case 'text':
        return defer(() => response.text())

      /* istanbul ignore next  */
      default:
        assertNever(dataType)
    }
  }
  return of(response)
}


/** "foo=cookiefoo; Secure; Path=/" */
export function parseRespCookie(cookie: string | null): Args['cookies'] {
  /* istanbul ignore else  */
  if (!cookie) {
    return
  }
  const arr = cookie.split(/;/)

  /* istanbul ignore else  */
  if (!arr.length) {
    return
  }
  const ret: Args['cookies'] = {}

  for (let row of arr) {
    row = row.trim()
    /* istanbul ignore else  */
    if (!row) {
      continue
    }
    if (!row.includes('=')) {
      continue
    }
    if (row.slice(0, 5) === 'Path=') {
      continue
    }
    const [key, value] = row.split('=')
    ret[key] = value
  }

  return ret
}
