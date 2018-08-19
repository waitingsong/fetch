import * as QueryString from 'qs'
import { defer, of, throwError, Observable } from 'rxjs'
import { catchError, concatMap, switchMap, timeout } from 'rxjs/operators'

import { initialRxRequestInit } from './config'
import { Args, ObbRetType, RxRequestInit } from './model'
import { parseInitOpts, splitInitArgs } from './request'
import { handleResponseError, parseResponseType, parseRespCookie } from './response'


/**
 * Observable fetch
 *
 * parameter init ignored during parameter input is typeof Request
 */
export function rxfetch<T extends ObbRetType = ObbRetType>(
  input: Request | string,
  init?: RxRequestInit,
): Observable<T> {

  /* istanbul ignore else */
  if (! input) {
    throwError(new TypeError('value of input invalid'))
  }
  const initOpts: RxRequestInit = init ? { ...initialRxRequestInit, ...init } : { ...initialRxRequestInit }
  const options = splitInitArgs(initOpts)
  const { args, requestInit } = parseInitOpts(options)
  const dataType: RxRequestInit['dataType'] = args.dataType
  const req$ = _fetch(input, args, requestInit)
  const ret$ = req$.pipe(
    concatMap(res => handleRedirect(res, args, requestInit)),
    concatMap(handleResponseError),
    switchMap<Response, T>(res => parseResponseType(res, dataType)),
  )

  return ret$
}


/** Observable GET method of fetch() */
export function get<T extends ObbRetType = ObbRetType>(input: string, init?: RxRequestInit): Observable<T> {
  /* istanbul ignore else */
  if (init) {
    init.method = 'GET'
  }
  else {
    init = { method: 'GET' }
  }
  return rxfetch(input, init)
}


/** Observable POST method of fetch() */
export function post<T extends ObbRetType = ObbRetType>(input: string, init?: RxRequestInit): Observable<T> {
  /* istanbul ignore else */
  if (init) {
    init.method = 'POST'
  }
  else {
    init = { method: 'POST' }
  }
  return rxfetch(input, init)
}


/** Observable PUT method of fetch() */
export function put<T extends ObbRetType = ObbRetType>(input: string, init?: RxRequestInit): Observable<T> {
  /* istanbul ignore else */
  if (init) {
    init.method = 'PUT'
  }
  else {
    init = { method: 'PUT' }
  }
  return rxfetch(input, init)
}


/** Observable DELETE method of fetch() */
export function remove<T extends ObbRetType = ObbRetType>(input: string, init?: RxRequestInit): Observable<T> {
  /* istanbul ignore else */
  if (init) {
    init.method = 'DELETE'
  }
  else {
    init = { method: 'DELETE' }
  }
  return rxfetch(input, init)
}


/** Update initialRxRequestInit */
export function setGloalRequestInit(config: Partial<RxRequestInit>): void {
  for (const [key, value] of Object.entries(config)) {
    Object.defineProperty(initialRxRequestInit, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value,
    })
  }
}

/** Get copy of initialRxRequestInit */
export function getGloalRequestInit(): Readonly<RxRequestInit> {
  return { ...initialRxRequestInit }
}


export function buildQueryString(url: string, data: RxRequestInit['data']): string {
  /* istanbul ignore else */
  if (data && typeof data === 'object' && Object.keys(data).length) {
    const ps = QueryString.stringify(data)
    return url.includes('?') ? `${url}&${ps}` : `${url}?${ps}`
  }
  return url
}


/**
 * fetch wrapper
 *
 * parameter init ignored during parameter input is typeof Request
 */
function _fetch(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
): Observable<Response> {

  /* istanbul ignore else */
  if (! input) {
    throwError(new TypeError('value of input invalid'))
  }

  let req$: Observable<Response>
  const fetchModule = selectFecthModule(args.fetchModule)

  if (typeof input === 'string') {
    /* istanbul ignore else */
    if (typeof args.data !== 'undefined') {
      if (args.processData) {
        if (['GET', 'DELETE'].includes(<string> requestInit.method)) {
          input = buildQueryString(input, args.data)
        }
        else {
          requestInit.body = QueryString.stringify(args.data)
        }
      }
      else {
        requestInit.body = <any> args.data
      }

      delete args.data
    }

    req$ = defer(() => (<NonNullable<Args['fetchModule']>> fetchModule)(input, requestInit))
  }
  else {
    req$ = defer(() => (<NonNullable<Args['fetchModule']>> fetchModule)(<Request> input))
  }

  /* istanbul ignore else */
  if (typeof args.timeout === 'number' && args.timeout >= 0) {
    req$ = req$.pipe(
      timeout(args.timeout),
      catchError(err => {
        if (args.abortController && !args.abortController.signal.aborted) {
          args.abortController.abort()
        }
        throw err
      }),
    )
  }

  return req$
}


/** select fetch instance from args.fetchModule or native */
function selectFecthModule(mod: Args['fetchModule'] | null): Args['fetchModule'] {
  let fetchModule: Args['fetchModule'] | null = null

  if (mod) {
    /* istanbul ignore else */
    if (typeof mod !== 'function') {
      throwError(new TypeError('fetchModule is not Function'))
    }
    fetchModule = mod
  }
  /* istanbul ignore else */
  else if (typeof fetch === 'function') { // native fetch
    fetchModule = fetch
  }
  else {
    throwError(new TypeError('fetchModule/fetch not Function'))
  }

  return <Args['fetchModule']> fetchModule
}

/**
 * Handle redirect case to retrieve cookies before jumping under Node.js.
 * There's no effect under Browser
 *
 * docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
function handleRedirect(resp: Response, args: Args, init: RequestInit): Observable<Response> {
  /* istanbul ignore else */
  if (args.keepRedirectCookies === true && resp.status >= 301 && resp.status <= 308) {
    const url = resp.headers.get('location')
    const cookie = resp.headers.get('Set-Cookie')

    /* istanbul ignore if */
    if (! url) {
      throwError('Redirect location is empty')
    }
    else {
      const cookieObj = parseRespCookie(cookie)
      if (cookieObj) {
        args.cookies = args.cookies
          ? { ...args.cookies, ...cookieObj }
          : { ...cookieObj }
      }
      const options = parseInitOpts({ args, requestInit: init })

      if (resp.status === 303) {
        const ps = <RxRequestInit> { ...options.requestInit, ...options.args }
        return get(url, ps)
      }
      else {
        return _fetch(url, options.args, options.requestInit)
      }
    }
  }
  return of(resp)
}
