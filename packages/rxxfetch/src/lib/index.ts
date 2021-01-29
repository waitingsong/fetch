/* eslint-disable @typescript-eslint/no-explicit-any */
import { throwError, Observable } from 'rxjs'
import { concatMap } from 'rxjs/operators'

import { initialRxRequestInit } from './config'
import { ObbRetType, RxRequestInit } from './model'
import { _fetch } from './request'
import { handleResponseError, parseResponseType } from './response'
import { parseInitOpts, splitInitArgs } from './util'


/**
 * Observable fetch
 *
 * parameter init ignored during parameter input is typeof Request
 */
export function rxfetch<T extends ObbRetType = any>(
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
  const dataType = args.dataType as NonNullable<RxRequestInit['dataType']>
  const req$ = _fetch(input, args, requestInit)
  const ret$ = req$.pipe(
    concatMap(res => handleResponseError(res, dataType === 'bare')),
    concatMap(res => parseResponseType(res, dataType) as Observable<T>),
  )

  return ret$
}


/** Observable GET method of fetch() */
export function get<T extends ObbRetType = any>(input: string, init?: RxRequestInit): Observable<T> {
  const ps: RxRequestInit = init
    ? { ...init, method: 'GET' }
    : { method: 'GET' }

  return rxfetch<T>(input, ps)
}


/** Observable POST method of fetch() */
export function post<T extends ObbRetType = any>(input: string, init?: RxRequestInit): Observable<T> {
  const ps: RxRequestInit = init
    ? { ...init, method: 'POST' }
    : { method: 'POST' }

  return rxfetch<T>(input, ps)
}


/** Observable PUT method of fetch() */
export function put<T extends ObbRetType = any>(input: string, init?: RxRequestInit): Observable<T> {
  const ps: RxRequestInit = init
    ? { ...init, method: 'PUT' }
    : { method: 'PUT' }

  return rxfetch<T>(input, ps)
}


/** Observable DELETE method of fetch() */
export function remove<T extends ObbRetType = any>(input: string, init?: RxRequestInit): Observable<T> {
  const ps: RxRequestInit = init
    ? { ...init, method: 'DELETE' }
    : { method: 'DELETE' }

  return rxfetch<T>(input, ps)
}


/** Update initialRxRequestInit */
export function setGloalRequestInit(config: Partial<RxRequestInit>): void {
  for (const [key, value] of Object.entries(config)) {
    Object.defineProperty(initialRxRequestInit, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value,
    })
  }
}

/** Get copy of initialRxRequestInit */
export function getGloalRequestInit(): Readonly<RxRequestInit> {
  return { ...initialRxRequestInit }
}

