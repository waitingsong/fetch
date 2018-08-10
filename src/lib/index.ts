import * as QueryString from 'qs'
import { defer, of, throwError, Observable } from 'rxjs'
import { catchError, concatMap, map, switchMap, timeout } from 'rxjs/operators'

import { httpErrorMsgPrefix, initialRxRequestInit } from './config'
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

  const { args, requestInit } = parseInitOpts(init)


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

  const dataType: RxRequestInit['dataType'] = args.dataType

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

  const ret$ = req$.pipe(
    concatMap(handleResponseError),
    switchMap<Response, T>(res => parseResponseType(res, dataType)),
  )

  return ret$
}


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


export interface ArgsRequestInitCombined {
  args: Args
  requestInit: RequestInit
}


/** Split RxRequestInit object to RequestInit and Args */
function splitInitArgs(rxInitOpts: RxRequestInit): ArgsRequestInitCombined {
  const args: Args = {}

  /* istanbul ignore else */
  if (rxInitOpts.abortController && typeof rxInitOpts.abortController.abort === 'function') {
    args.abortController = rxInitOpts.abortController
    delete rxInitOpts.abortController
  }

  /* istanbul ignore else */
  if (typeof rxInitOpts.contentType !== 'undefined') {
    args.contentType = rxInitOpts.contentType
    delete rxInitOpts.contentType
  }

  /* istanbul ignore else */
  if (typeof rxInitOpts.data !== 'undefined') {
    args.data = rxInitOpts.data
    delete rxInitOpts.data
  }

  /* istanbul ignore else */
  if (rxInitOpts.dataType) {
    args.dataType = rxInitOpts.dataType
    delete rxInitOpts.dataType
  }

  /* istanbul ignore else */
  if (rxInitOpts.fetchModule) {
    args.fetchModule = rxInitOpts.fetchModule
    delete rxInitOpts.fetchModule
  }

  /* istanbul ignore else */
  if (rxInitOpts.headersInitClass) {
    args.headersInitClass = rxInitOpts.headersInitClass
    delete rxInitOpts.headersInitClass
  }

  /* istanbul ignore else */
  if (typeof rxInitOpts.processData !== 'undefined') {
    args.processData = rxInitOpts.processData
    delete rxInitOpts.processData
  }

  /* istanbul ignore else */
  if (typeof rxInitOpts.timeout !== 'undefined') {
    args.timeout = rxInitOpts.timeout
    delete rxInitOpts.timeout
  }

  return {
    args,
    requestInit: <RequestInit> { ...rxInitOpts },
  }
}


export function parseInitOpts(init?: RxRequestInit): ArgsRequestInitCombined {
  const initOpts: RxRequestInit = init ? { ...initialRxRequestInit, ...init } : { ...initialRxRequestInit }
  let options = splitInitArgs(initOpts)

  options = parseAbortController(options)
  options = parseHeaders(options)
  options = parseMethod(options)
  options.args = parseDataType(options.args)
  options.args.timeout = parseTimeout(options.args.timeout)

  return options
}

function parseAbortController(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  /* istanbul ignore else */
  if (! args.abortController || ! args.abortController.signal || typeof args.abortController.abort !== 'function') {
    /* istanbul ignore else */
    if (typeof AbortController === 'function') {
      args.abortController = new AbortController()
    }
  }
  /* istanbul ignore else */
  if (args.abortController) {
    requestInit.signal = args.abortController.signal
  }

  return { args, requestInit }
}

function parseHeaders(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options
  const headersInitClass = args.headersInitClass
    ? args.headersInitClass
    : (typeof Headers === 'function' ? Headers : null)

  if (! headersInitClass) {
    throw new TypeError('Headers not defined')
  }
  let headers = <Headers> requestInit.headers

  /* istanbul ignore else */
  if (! headers || typeof headers.has !== 'function') {
    headers = requestInit.headers
      ? <Headers> new headersInitClass(requestInit.headers)
      : <Headers> new headersInitClass()
  }

  /* istanbul ignore else */
  if (! headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/html, text/javascript, text/plain, */*')
  }

  requestInit.headers = headers

  return { args, requestInit }
}


function parseMethod(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  switch (requestInit.method) {
    case 'DELETE':
    case 'POST':
    case 'PUT':
      if (args.contentType === false) {
        break
      }
      else if (args.contentType) {
        (<Headers> requestInit.headers).set('Content-Type', args.contentType)
      }
      /* istanbul ignore else */
      else if (! (<Headers> requestInit.headers).has('Content-Type')) {
        (<Headers> requestInit.headers).set('Content-Type', 'application/x-www-form-urlencoded')
      }
      break
  }
  return { args, requestInit }
}

function parseDataType(args: Args): Args {
  /* istanbul ignore else */
  if (! args.dataType) {
    args.dataType = 'json'
  }
  return args
}

function parseTimeout(p: any): number | null {
  const value = typeof p === 'number' && p >= 0 ? Math.ceil(p) : null
  return value === null || ! Number.isSafeInteger(value) ? null : value
}


function handleResponseError(resp: Response): Observable<Response> {
  /* istanbul ignore else */
  if (resp.ok) {
    return of(resp)
  }
  const status = resp.status

  return defer(() => resp.text()).pipe(
    catchError((err: Error) => of(err ? err.toString() : 'unknow error')),
    map((txt: string) => {
      throw new Error(`${httpErrorMsgPrefix}${status}\nResponse:` + txt)
    }),
  )
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
