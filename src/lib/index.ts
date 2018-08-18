import * as QueryString from 'qs'
import { defer, throwError, Observable } from 'rxjs'
import { catchError, concatMap, switchMap, timeout } from 'rxjs/operators'

import { initialRxRequestInit } from './config'
import { Args, ObbRetType, RxRequestInit } from './model'
import { parseInitOpts } from './request'
import { handleResponseError, parseResponseType } from './response'


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

  const { args, requestInit } = parseInitOpts(init)
  const dataType: RxRequestInit['dataType'] = args.dataType
  const req$ = _fetch(input, args, requestInit)
  const ret$ = req$.pipe(
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

  // let fetchModule: Args['fetchModule'] | null = typeof fetch === 'function' ? fetch : null
  let fetchModule: Args['fetchModule'] | null = null

  if (args.fetchModule) {
    /* istanbul ignore else */
    if (typeof args.fetchModule !== 'function') {
      throwError(new TypeError('fetchModule is not Function'))
    }
    fetchModule = args.fetchModule
  }
  /* istanbul ignore else */
  else if (typeof fetch === 'function') { // native fetch
    fetchModule = fetch
  }
  else {
    throwError(new TypeError('fetchModule/fetch not Function'))
  }

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
