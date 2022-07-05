import NodeFormData from 'form-data'
import QueryString from 'qs'

import { initialOptions } from './config.js'
import {
  Args,
  ArgsRequestInitCombined,
  ContentTypeList,
  Options,
} from './types.js'


/** Update initialFetchOptions */
export function setGloalRequestOptions(options: Partial<Options>): void {
  for (const [key, value] of Object.entries(options)) {
    Object.defineProperty(initialOptions, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value,
    })
  }
}

/** Get copy of initialFetchOptions */
export function getGloalRequestOptions(): Readonly<Options> {
  return { ...initialOptions }
}


export function buildQueryString(url: string, data: Options['data']): string {
  /* istanbul ignore else */
  if (data && typeof data === 'object' && Object.keys(data).length) {
    const ps = QueryString.stringify(data)
    return url.includes('?') ? `${url}&${ps}` : `${url}?${ps}`
  }
  return url
}


/** Split FetchOptions object to RequestInit and Args */
export function splitInitArgs(options: Options): ArgsRequestInitCombined {
  const opts: Options = { ...options }
  const args: Args = {}

  /* istanbul ignore else */
  if (typeof opts.cookies !== 'undefined') {
    args.cookies = opts.cookies
  }
  delete opts.cookies

  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (opts.abortController && typeof opts.abortController.abort === 'function') {
    args.abortController = opts.abortController
  }
  delete opts.abortController

  /* istanbul ignore else */
  if (typeof opts.contentType !== 'undefined') {
    args.contentType = opts.contentType
  }
  delete opts.contentType

  /* istanbul ignore else */
  if (typeof opts.data !== 'undefined') {
    args.data = opts.data
  }
  delete opts.data

  /* istanbul ignore else */
  if (opts.dataType) {
    args.dataType = opts.dataType
  }
  delete opts.dataType

  /* istanbul ignore else */
  if (opts.fetchModule) {
    args.fetchModule = opts.fetchModule
  }
  delete opts.fetchModule

  /* istanbul ignore else */
  if (opts.headersInitClass) {
    args.headersInitClass = opts.headersInitClass
  }
  delete opts.headersInitClass

  /* istanbul ignore else */
  if (typeof opts.keepRedirectCookies !== 'undefined') {
    args.keepRedirectCookies = !! opts.keepRedirectCookies
  }
  delete opts.keepRedirectCookies

  /* istanbul ignore else */
  if (typeof opts.processData !== 'undefined') {
    args.processData = opts.processData
  }
  delete opts.processData

  /* istanbul ignore else */
  if (typeof opts.timeout !== 'undefined') {
    args.timeout = opts.timeout
  }
  delete opts.timeout

  return {
    args,
    requestInit: { ...opts } as RequestInit,
  }
}


export function processParams(
  options: Options,
): ArgsRequestInitCombined {
  const initOpts: Options = { ...initialOptions, ...options }
  const opts = splitInitArgs(initOpts)
  return processInitOpts(opts)
}

export function processInitOpts(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  let opts = { ...options }
  opts = processHeaders(opts) // at first!

  opts = processAbortController(opts)
  opts = processCookies(opts)
  opts = processMethod(opts)
  opts.args.dataType = processDataType(opts.args.dataType)
  opts.args.timeout = parseTimeout(opts.args.timeout)
  const redirect = processRedirect(
    opts.args.keepRedirectCookies as boolean,
    opts.requestInit.redirect,
  )
  if (redirect) {
    opts.requestInit.redirect = redirect
  }

  return opts
}


function processHeaders(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  /* istanbul ignore else */
  if (args.headersInitClass) { // node.js need pass headers class
    const headers = requestInit.headers
      ? new args.headersInitClass(requestInit.headers)
      : new args.headersInitClass()
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


function processAbortController(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  if (! args.abortController || typeof args.abortController.abort !== 'function') {
    if (typeof AbortController === 'function') {
      args.abortController = new AbortController()
    }
    else {
      throw new Error('AbortController not avaiable')
    }
  }

  requestInit.signal = args.abortController.signal

  return { args, requestInit }
}


function processCookies(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
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


function processMethod(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
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
function processDataType(value: unknown): NonNullable<Args['dataType']> {
  /* istanbul ignore else */
  if (typeof value === 'string'
    && ['arrayBuffer', 'bare', 'blob', 'formData', 'json', 'text', 'raw'].includes(value)) {
    return value as NonNullable<Args['dataType']>
  }
  return 'json'
}


function parseTimeout(ps: unknown): number {
  const value = typeof ps === 'number' && ps >= 0 ? Math.ceil(ps) : Infinity
  return value === Infinity || ! Number.isSafeInteger(value) ? Infinity : value
}


/**
 * set redirect to 'manul' for retrieve cookies during 301/302 when keepRedirectCookies:TRUE
 * and current value only when "follow"
 */
function processRedirect(
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
      throw new TypeError('fetchModule is not Function')
    }
    fetchModule = mod
  }
  /* istanbul ignore else */
  else if (typeof fetch === 'function') { // native fetch
    fetchModule = fetch
  }
  else {
    throw new TypeError('fetchModule/fetch not Function')
  }

  return fetchModule
}


/**
 * Return input url string
 */
export function processRequestGetLikeData(input: string, args: Args): string {
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


export function processRequestPostLikeData(args: Args): NonNullable<RequestInit['body']> | undefined {
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

/** "foo=cookiefoo; Secure; Path=/" */
export function parseRespCookie(cookie: string | null): Args['cookies'] {
  /* istanbul ignore else  */
  if (! cookie) {
    return
  }
  // eslint-disable-next-line require-unicode-regexp
  const arr = cookie.split(/;/)
  const ret: Args['cookies'] = {}

  for (let row of arr) {
    row = row.trim()
    /* istanbul ignore else  */
    if (! row) {
      continue
    }
    if (! row.includes('=')) {
      continue
    }
    if (row.startsWith('Path=')) {
      continue
    }
    const [key, value] = row.split('=')
    /* istanbul ignore else  */
    if (key && value) {
      ret[key] = value
    }
  }

  /* istanbul ignore else  */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ret && Object.keys(ret).length) {
    return ret
  }
}

