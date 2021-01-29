/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-expect-error
import { AbortController as _AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import NodeFormData from 'form-data'
import QueryString from 'qs'
import { throwError } from 'rxjs'

import { Args, ArgsRequestInitCombined, RxRequestInit, ContentTypeList } from './model'


export function buildQueryString(url: string, data: RxRequestInit['data']): string {
  /* istanbul ignore else */
  if (data && typeof data === 'object' && Object.keys(data).length) {
    const ps = QueryString.stringify(data)
    return url.includes('?') ? `${url}&${ps}` : `${url}?${ps}`
  }
  return url
}


/** Split RxRequestInit object to RequestInit and Args */
export function splitInitArgs(rxInitOpts: RxRequestInit): ArgsRequestInitCombined {
  const tmpObj: RxRequestInit = { ...rxInitOpts }
  const args: Args = {}

  /* istanbul ignore else */
  if (typeof tmpObj.cookies !== 'undefined') {
    args.cookies = tmpObj.cookies
  }
  delete tmpObj.cookies

  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (tmpObj.abortController && typeof tmpObj.abortController.abort === 'function') {
    args.abortController = tmpObj.abortController
  }
  delete tmpObj.abortController

  /* istanbul ignore else */
  if (typeof tmpObj.contentType !== 'undefined') {
    args.contentType = tmpObj.contentType
  }
  delete tmpObj.contentType

  /* istanbul ignore else */
  if (typeof tmpObj.data !== 'undefined') {
    args.data = tmpObj.data
  }
  delete tmpObj.data

  /* istanbul ignore else */
  if (tmpObj.dataType) {
    args.dataType = tmpObj.dataType
  }
  delete tmpObj.dataType

  /* istanbul ignore else */
  if (tmpObj.fetchModule) {
    args.fetchModule = tmpObj.fetchModule
  }
  delete tmpObj.fetchModule

  /* istanbul ignore else */
  if (tmpObj.headersInitClass) {
    args.headersInitClass = tmpObj.headersInitClass
  }
  delete tmpObj.headersInitClass

  /* istanbul ignore else */
  if (typeof tmpObj.keepRedirectCookies !== 'undefined') {
    args.keepRedirectCookies = !! tmpObj.keepRedirectCookies
  }
  delete tmpObj.keepRedirectCookies

  /* istanbul ignore else */
  if (typeof tmpObj.processData !== 'undefined') {
    args.processData = tmpObj.processData
  }
  delete tmpObj.processData

  /* istanbul ignore else */
  if (typeof tmpObj.timeout !== 'undefined') {
    args.timeout = tmpObj.timeout
  }
  delete tmpObj.timeout

  return {
    args,
    requestInit: { ...tmpObj } as RequestInit,
  }
}


export function parseInitOpts(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  let opts = { ...options }
  opts = parseHeaders(opts) // at first!

  opts = parseAbortController(opts)
  opts = parseCookies(opts)
  opts = parseMethod(opts)
  opts.args.dataType = parseDataType(opts.args.dataType)
  opts.args.timeout = parseTimeout(opts.args.timeout)
  opts.requestInit.redirect = parseRedirect(opts.args.keepRedirectCookies as boolean, opts.requestInit.redirect)

  return opts
}


function parseHeaders(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  /* istanbul ignore else */
  if (args.headersInitClass) { // node.js need pass headers class
    const headers = requestInit.headers
      ? new args.headersInitClass(requestInit.headers) as Headers
      : new args.headersInitClass() as Headers
    requestInit.headers = headers
  }
  else if (typeof Headers === 'function') { // browser native
    requestInit.headers = requestInit.headers
      ? new Headers(requestInit.headers)
      : new Headers()
  }
  else {
    throw new TypeError(`parseHeaders(): Headers Class undefined.
If running under Node.js, it must pass HeaderClass such come from package "node-fetch".`)
  }

  const { headers } = requestInit

  /* istanbul ignore else */
  if (! headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/html, text/javascript, text/plain, */*')
  }

  return { args, requestInit }
}


function parseAbortController(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  /* istanbul ignore else */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! args.abortController || ! args.abortController.signal || typeof args.abortController.abort !== 'function') {
    args.abortController = typeof AbortController === 'function'
      ? new AbortController()
      : new _AbortController()
  }
  /* istanbul ignore else */
  if (args.abortController) {
    requestInit.signal = args.abortController.signal
  }

  return { args, requestInit }
}


function parseCookies(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options
  const data = args.cookies
  const arr: string[] = []

  if (data && typeof data === 'object') {
    for (let [key, value] of Object.entries(data)) {
      /* istanbul ignore else */
      if (key && typeof key === 'string') {
        key = key.trim()
        /* istanbul ignore else */
        if (! key) {
          continue
        }

        value = typeof value === 'string' || typeof value === 'number' ? value.toString().trim() : ''
        arr.push(`${key}=${value}`)
      }
    }
  }

  if (arr.length) {
    const headers = requestInit.headers as Headers
    let cookies = headers.get('Cookie')

    if (cookies) {
      cookies = cookies.trim()
      let ret = arr.join('; ')
      /* istanbul ignore if */
      if (cookies.endsWith(';')) {
        cookies = cookies.slice(0, -1)
        ret = `${cookies}; ` + ret
      }
      else {
        ret = `${cookies}; ` + ret
      }

      headers.set('Cookie', ret)
    }
    else {
      headers.set('Cookie', arr.join('; '))
    }
  }

  return { args, requestInit }
}


function parseMethod(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  if (requestInit.method && ['DELETE', 'POST', 'PUT'].includes(requestInit.method)) {

    const headers = requestInit.headers as Headers

    if (args.contentType === false) {
      void 0
    }
    else if (args.contentType) {
      headers.set('Content-Type', args.contentType)
    }
    /* istanbul ignore else */
    else if (! headers.has('Content-Type')) {
      headers.set('Content-Type', ContentTypeList.json)
    }
  }

  return { args, requestInit }
}


/**
 * Parse type of return data
 * @returns default: json
 **/
function parseDataType(value: unknown): NonNullable<Args['dataType']> {
  /* istanbul ignore else */
  if (typeof value === 'string' && ['arrayBuffer', 'bare', 'blob', 'formData', 'json', 'text', 'raw'].includes(value)) {
    return value as NonNullable<Args['dataType']>
  }
  return 'json'
}


function parseTimeout(ps: unknown): number | null {
  const value = typeof ps === 'number' && ps >= 0 ? Math.ceil(ps) : null
  return value === null || ! Number.isSafeInteger(value) ? null : value
}


/**
 * set redirect to 'manul' for retrieve cookies during 301/302 when keepRedirectCookies:TRUE
 * and current value only when "follow"
 */
function parseRedirect(
  keepRedirectCookies: boolean,
  curValue: RequestInit['redirect'] | undefined,
): RequestInit['redirect'] {

  // not change value if on Browser
  /* istanbul ignore else */
  if (keepRedirectCookies === true && typeof window === 'undefined') {
    /* istanbul ignore else */
    if (curValue === 'follow') {
      return 'manual'
    }
  }

  return curValue ? curValue : 'follow'
}

/** Select fetch instance from args.fetchModule or native */
export function selectFecthModule(mod: Args['fetchModule'] | null): NonNullable<Args['fetchModule']> {
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

  return fetchModule as NonNullable<Args['fetchModule']>
}


/**
 * Return input url string
 */
export function parseRequestGetLikeData(input: string, args: Args): string {
  let url = ''

  if (typeof args.data === 'undefined') {
    url = input
  }
  else if (args.processData) { // override the value of body by args.data
    url = buildQueryString(input, args.data)
  }
  else {
    throw new TypeError(
      'Typeof args.data invalid for GET/DELETE when args.processData not true, type is :' + typeof args.data,
    )
  }

  return url
}


export function parseRequestPostLikeData(args: Args): NonNullable<RequestInit['body']> | undefined {
  let body: NonNullable<RequestInit['body']> | undefined
  const { data } = args

  if (typeof data === 'string') {
    body = data
  }
  else if (typeof data === 'undefined' || data === null) {
    // void
  }
  else if (typeof FormData !== 'undefined' && data instanceof FormData) {
    body = data
  }
  else if (typeof NodeFormData !== 'undefined' && data instanceof NodeFormData) {
    // @ts-expect-error
    body = data
  }
  else if (typeof Blob !== 'undefined' && data instanceof Blob) {
    body = data
  }
  else if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
    body = data
  }
  else if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
    body = data
  }
  else if (typeof ReadableStream !== 'undefined' && data instanceof ReadableStream) {
    body = data
  }
  else { // json object or Array, or other
    // eslint-disable-next-line no-lonely-if
    if (args.processData && args.contentType && args.contentType.includes('json')) {
      body = JSON.stringify(data)
    }
    else if (args.processData) {
      body = QueryString.stringify(data)
    }
    else {
      body = data as NonNullable<RequestInit['body']>
    }
  }

  return body
}

