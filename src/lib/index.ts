import * as QueryString from 'qs'
import { defer, of, throwError, Observable } from 'rxjs'
import { catchError, concatMap, map, switchMap, tap, timeout } from 'rxjs/operators'

import { initialRxRequestInit } from './config'
import { Args, ObbRetType, RxRequestInit } from './model'
import { assertNever } from './shared'


/**
 * fetch wrapper
 *
 * parameter init ignored during parameter input is typeof Request
 */
export function rxfetch<T extends ObbRetType = ObbRetType>(
  input: Request | string,
  init?: RxRequestInit,
): Observable<T> {

  if (! input) {
    throwError(new TypeError('value of input invalid'))
  }

  let req$: Observable<Response>

  const initOpts = parseInitOpts(init)
  // let fetchModule: Args['fetchModule'] | null = typeof fetch === 'function' ? fetch : null
  let fetchModule: Args['fetchModule'] | null = null

  if (initOpts.fetchModule) {
    /* istanbul ignore else */
    if (typeof initOpts.fetchModule !== 'function') {
      throwError(new TypeError('fetchModule is not Function'))
    }
    fetchModule = initOpts.fetchModule
    delete initOpts.fetchModule
    delete initOpts.fetchHeadersClass
  }
  /* istanbul ignore else */
  else if (typeof fetch === 'function') { // native fetch
    fetchModule = fetch
  }
  else {
    throwError(new TypeError('fetchModule/fetch not Function'))
  }

  const dataType: RxRequestInit['dataType'] = initOpts.dataType
  const throwErrorIfHigher400 = typeof initOpts.throwErrorIfHigher400 === 'boolean'
    ? initOpts.throwErrorIfHigher400
    : true
  const timeoutValue = (initOpts.timeout && initOpts.timeout >= 0 && Number.isSafeInteger(initOpts.timeout))
    ? initOpts.timeout
    : null

  if (typeof input === 'string') {
    /* istanbul ignore else */
    if (typeof initOpts.data !== 'undefined') {
      if (initOpts.processData) {
        if (['GET', 'DELETE'].includes(<string> initOpts.method)) {
          input = buildQueryString(input, initOpts.data)
        }
        else {
          initOpts.body = QueryString.stringify(initOpts.data)
        }
      }
      else {
        initOpts.body = <any> initOpts.data
      }

      delete initOpts.data
    }

    delete initOpts.dataType
    delete initOpts.contentType
    delete initOpts.timeout
    delete initOpts.throwErrorIfHigher400

    req$ = defer(() => (<NonNullable<Args['fetchModule']>> fetchModule)(input, initOpts))
  }
  else {
    req$ = defer(() => (<NonNullable<Args['fetchModule']>> fetchModule)(<Request> input))
  }


  let ret$ = req$.pipe(
    tap((res: Response) => {
      /* istanbul ignore else */
      if (!res.ok) {
        throw new Error(`Fetch error status: ${res.status}`)
      }
    }),
  )

  /* istanbul ignore else */
  if (timeoutValue && timeoutValue >= 0) {
    ret$ = ret$.pipe(timeout(timeoutValue))
  }

  /* istanbul ignore else */
  if (throwErrorIfHigher400) {
    ret$ = ret$.pipe(
      concatMap(res => {
        /* istanbul ignore else */
        if (throwErrorIfHigher400 && res.status >= 400) {
          return defer(() => res.text()).pipe(
            catchError((err: Error) => of(err ? err.toString() : 'unknow error')),
            map((txt: string) => {
              throw new TypeError(`Fetch error status: ${res.status}\nResponse: ` + txt)
            }),
          )
        }
        return of(res)
      }),
    )
  }

  return ret$.pipe(
    switchMap<Response, T>(res => parseResponseType(res, dataType)),
  )
}


export function get<T extends ObbRetType = ObbRetType>(input: string, init ?: RxRequestInit): Observable<T> {
  /* istanbul ignore else */
  if (init) {
    init.method = 'GET'
  }
  else {
    init = { method: 'GET' }
  }
  return rxfetch(input, init)
}


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
export function setGloalRequestInit(config: Partial<Args>): void {
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
  return data ? `${url}?${QueryString.stringify(data)}` : url
}


function parseResponseType(response: Response, dataType: RxRequestInit['dataType']): Observable<ObbRetType> {
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

      default:
        assertNever(dataType)
    }
  }
  return of(response)
}


function parseInitOpts(init?: RxRequestInit): RxRequestInit {
  const initOpts: RxRequestInit = init ? { ...initialRxRequestInit, ...init } : { ...initialRxRequestInit }
  // const fetchModule = initOpts.fetchModule ? initOpts.fetchModule : null
  const hClass = initOpts.fetchHeadersClass ? initOpts.fetchHeadersClass : Headers

  initOpts.headers = <Headers> (initOpts.headers ? new hClass(initOpts.headers) : new hClass())
  /* istanbul ignore else  */
  if (!initOpts.headers.has('Accept')) {
    initOpts.headers.set('Accept', 'application/json, text/html, text/javascript, text/plain, */*')
  }

  switch (initOpts.method) {
    case 'DELETE':
      if (initOpts.contentType === false) {
        break
      }
      else if (initOpts.contentType) {
        initOpts.headers.set('Content-Type', initOpts.contentType)
      }
      /* istanbul ignore else  */
      else if (!initOpts.headers.has('Content-Type')) {
        initOpts.headers.set('Content-Type', 'application/x-www-form-urlencoded')
      }
      break

    case 'POST':
      if (initOpts.contentType === false) {
        break
      }
      else if (initOpts.contentType) {
        initOpts.headers.set('Content-Type', initOpts.contentType)
      }
      /* istanbul ignore else  */
      else if (!initOpts.headers.has('Content-Type')) {
        initOpts.headers.set('Content-Type', 'application/x-www-form-urlencoded')
      }
      break

    case 'PUT':
      if (initOpts.contentType === false) {
        break
      }
      else if (initOpts.contentType) {
        initOpts.headers.set('Content-Type', initOpts.contentType)
      }
      /* istanbul ignore else  */
      else if (!initOpts.headers.has('Content-Type')) {
        initOpts.headers.set('Content-Type', 'application/x-www-form-urlencoded')
      }
      break
  }

  /* istanbul ignore else  */
  if (! initOpts.dataType) {
    initOpts.dataType = 'json'
  }

  return initOpts
}
