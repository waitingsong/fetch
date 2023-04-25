/* eslint-disable @typescript-eslint/no-explicit-any */
import { OverwriteAnyToUnknown } from '@waiting/shared-types'
import { Response } from 'undici'

import { _fetch } from './request.js'
import { handleResponseError, processResponseType } from './response.js'
import { trace } from './trace.js'
import { AttributeKey, ResponseData, Options } from './types.js'
import { processParams } from './util.js'


/**
 * Fetch with strict types
 *
 * @description generics any will be overwriten to unknown
 */
export async function fetch<T extends ResponseData = any>(
  options: Options,
): Promise<OverwriteAnyToUnknown<T>> {

  const [ret] = await fetch2<T>(options)
  return ret as OverwriteAnyToUnknown<T>
}


/**
 * Fetch with strict types
 *
 * @returns [result, response header]
 * @description generics any will be overwriten to unknown
 */
export async function fetch2<T extends ResponseData>(
  options: Options,
): Promise<[T, Headers]> {

  trace(AttributeKey.PrepareRequestData, options.span)
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
    trace(AttributeKey.RequestTimeout, options.span)
    throw new Error(`fetch timeout in "${timeout as number}ms"`)
  }
  const dataType = (args.dataType ?? 'bare') as NonNullable<Options['dataType']>

  trace(AttributeKey.ProcessResponseStart, options.span)
  let resp: Response = await handleResponseError(data, dataType === 'bare')
  const respHeaders = resp.headers as unknown as Headers
  if (typeof options.beforeProcessResponseCallback === 'function') {
    resp = await options.beforeProcessResponseCallback(resp)
  }
  const ret = await processResponseType(resp, dataType) as T
  trace(AttributeKey.ProcessResponseFinish, options.span)

  return [ret, respHeaders]
}


/**
 * Fetch Get with strict types, default response is JSON
 *
 * @description generics any will be overwriten to unknown
 */
export function get<T extends ResponseData = any>(
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
export function post<T extends ResponseData = any>(
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
export function put<T extends ResponseData = any>(
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
export function remove<T extends ResponseData = any>(
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

