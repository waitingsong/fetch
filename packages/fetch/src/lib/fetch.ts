/* eslint-disable @typescript-eslint/no-explicit-any */
import { OverwriteAnyToUnknown } from '@waiting/shared-types'

import { _fetch } from './request.js'
import { handleResponseError, processResponseType } from './response.js'
import { traceLog } from './tracer.js'
import { FetchResponse, Options } from './types.js'
import { processParams } from './util.js'


/**
 * Fetch with strict types
 *
 * @description generics any will be overwriten to unknown
 */
export async function fetch<T extends FetchResponse = any>(
  options: Options,
): Promise<OverwriteAnyToUnknown<T>> {

  traceLog('processParams', options.span)
  const { args, requestInit } = processParams(options)
  const { timeout } = args
  const timeout$ = typeof timeout === 'undefined' || timeout === Infinity || timeout < 0
    ? null
    : new Promise<undefined>(done => setTimeout(done, args.timeout))

  const req$ = _fetch(options.url, args, requestInit, options.span)

  const pm: (Promise<Response | undefined>)[] = [req$]
  if (timeout$) {
    pm.push(timeout$)
  }

  const data = await Promise.race(pm)

  if (typeof data === 'undefined') { // timeout
    abortReq(args.abortController)
    traceLog('timeout', options.span)
    throw new Error(`fetch timeout in "${timeout as number}ms"`)
  }
  const dataType = args.dataType as NonNullable<Options['dataType']>
  traceLog('handleResponseError', options.span)
  const resp = await handleResponseError(data, dataType === 'bare')
  traceLog('processResponseType-start', options.span)
  const ret = await processResponseType(resp, dataType)
  traceLog('processResponseType-finish', options.span)
  return ret as OverwriteAnyToUnknown<T>
}


/**
 * Fetch Get with strict types, default response is JSON
 *
 * @description generics any will be overwriten to unknown
 */
export function get<T extends FetchResponse = any>(
  url: string,
  options?: Omit<Options, 'url' | 'method'>,
): Promise<OverwriteAnyToUnknown<T>> {

  const opts: Options = {
    ...options,
    url,
    method: 'GET',
  }
  return fetch<T>(opts)
}


/**
 * Fetch Post with strict types
 *
 * @description generics any will be overwriten to unknown
 */
export function post<T extends FetchResponse = any>(
  url: Options['url'],
  options?: Omit<Options, 'url' | 'method'>,
): Promise<OverwriteAnyToUnknown<T>> {

  const opts: Options = {
    ...options,
    url,
    method: 'POST',
  }
  return fetch<T>(opts)
}


/**
 * Fetch Put with strict types
 *
 * @description generics any will be overwriten to unknown
 */
export function put<T extends FetchResponse = any>(
  url: Options['url'],
  options?: Omit<Options, 'url' | 'method'>,
): Promise<OverwriteAnyToUnknown<T>> {

  const opts: Options = {
    ...options,
    url,
    method: 'PUT',
  }
  return fetch<T>(opts)
}


/**
 * Fetch delete with strict types
 *
 * @description generics any will be overwriten to unknown
 */
export function remove<T extends FetchResponse = any>(
  url: Options['url'],
  options?: Omit<Options, 'url' | 'method'>,
): Promise<OverwriteAnyToUnknown<T>> {

  const opts: Options = {
    ...options,
    url,
    method: 'DELETE',
  }

  return fetch<T>(opts)
}


function abortReq(abc: AbortController | undefined): void {
  if (abc && ! abc.signal.aborted) {
    abc.abort()
  }
}

