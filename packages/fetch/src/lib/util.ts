import { ReadStream } from 'fs'

import NodeFormData from 'form-data'
import QueryString from 'qs'
import {
  FormData,
  Headers,
  RequestInfo as UndiciRequestInfo,
  RequestInit,
} from 'undici'

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

  if (typeof opts.data !== 'undefined') {
    args.data = opts.data
  }
  delete opts.data

  if (opts.dataType) {
    args.dataType = opts.dataType
  }
  delete opts.dataType

  /* c8 ignore next */
  if (typeof opts.keepRedirectCookies !== 'undefined') {
    args.keepRedirectCookies = !! opts.keepRedirectCookies
  }
  delete opts.keepRedirectCookies

  /* c8 ignore next */
  if (typeof opts.processData !== 'undefined') {
    args.processData = opts.processData
  }
  delete opts.processData

  /* c8 ignore next */
  if (typeof opts.timeout !== 'undefined') {
    args.timeout = opts.timeout
  }
  delete opts.timeout

  const requestInit = { ...opts } as RequestInit
  return {
    args,
    requestInit,
  }
}


export function processParams(options: Options): ArgsRequestInitCombined {
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
    !! opts.args.keepRedirectCookies,
    opts.requestInit.redirect,
  )
  if (redirect) {
    opts.requestInit.redirect = redirect
  }

  return opts
}


function processHeaders(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  requestInit.headers = requestInit.headers
    ? new Headers(requestInit.headers)
    : new Headers()

  const { headers } = requestInit

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
      throw new Error('AbortController not available')
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
 * set redirect to 'manual' for retrieve cookies during 301/302 when keepRedirectCookies:TRUE
 * and current value only when "follow"
 */
function processRedirect(
  keepRedirectCookies: boolean,
  curValue: RequestInit['redirect'] | undefined,
): RequestInit['redirect'] {

  // not change value if on Browser
  /* istanbul ignore else */
  if (keepRedirectCookies && typeof window === 'undefined') {
    /* istanbul ignore else */
    if (curValue === 'follow') {
      return 'manual'
    }
  }

  return curValue ? curValue : 'follow'
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
    throw new TypeError('Typeof args.data invalid for GET/DELETE when args.processData not true, type is :' + typeof args.data)
  }

  return url
}


export function processRequestPostLikeData(args: Args): RequestInit['body'] | null {
  let body: RequestInit['body'] | null
  const { data } = args

  if (typeof data === 'string') {
    body = data
  }
  else if (typeof data === 'undefined') {
    body = null
  }
  else if (data === null) {
    body = null
  }
  else if (data instanceof FormData) {
    body = data
  }
  else if (data instanceof NodeFormData) {
    throw new TypeError('NodeFormData from pkg "form-data" not supported, use FormData from "undici" instead')
  }
  else if (typeof Blob !== 'undefined' && data instanceof Blob) {
    // @ts-expect-error
    body = data
  }
  else if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
    body = data
  }
  else if (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams) {
    body = data
  }
  else if (typeof ReadableStream !== 'undefined' && data instanceof ReadableStream) {
    // @ts-expect-error
    body = data
  }
  else if (typeof ReadStream !== 'undefined' && data instanceof ReadStream) {
    body = data
  }
  else if (args.processData) {
    const { contentType } = args
    if (typeof contentType === 'string' && contentType.includes('json')) {
      body = JSON.stringify(data)
    }
    else {
      body = QueryString.stringify(data)
    }
  }
  else {
    body = data as NonNullable<RequestInit['body']>
  }

  return body
}

/** "foo=cookie_foo; Secure; Path=/" */
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


export function pickUrlStrFromRequestInfo(input: RequestInfo | UndiciRequestInfo): string {
  let url = ''
  if (typeof input === 'string') {
    url = input
  }
  else if (input instanceof URL) {
    url = input.toString()
  }
  else if (input instanceof Request) {
    url = input.url
  }
  else {
    url = ''
  }

  return url
}
