// @ts-ignore
import { AbortController as _AbortController } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import * as QueryString from 'qs'
import { throwError } from 'rxjs'

import { Args, ArgsRequestInitCombined, RxRequestInit } from './model'


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
  const args: Args = {}

  /* istanbul ignore else */
  if (typeof rxInitOpts.cookies !== 'undefined') {
    args.cookies = rxInitOpts.cookies
  }
  delete rxInitOpts.cookies

  // eslint-disable-next-line @typescript-eslint/unbound-method
  if (rxInitOpts.abortController && typeof rxInitOpts.abortController.abort === 'function') {
    args.abortController = rxInitOpts.abortController
  }
  delete rxInitOpts.abortController

  /* istanbul ignore else */
  if (typeof rxInitOpts.contentType !== 'undefined') {
    args.contentType = rxInitOpts.contentType
  }
  delete rxInitOpts.contentType

  /* istanbul ignore else */
  if (typeof rxInitOpts.data !== 'undefined') {
    args.data = rxInitOpts.data
  }
  delete rxInitOpts.data

  /* istanbul ignore else */
  if (rxInitOpts.dataType) {
    args.dataType = rxInitOpts.dataType
  }
  delete rxInitOpts.dataType

  /* istanbul ignore else */
  if (rxInitOpts.fetchModule) {
    args.fetchModule = rxInitOpts.fetchModule
  }
  delete rxInitOpts.fetchModule

  /* istanbul ignore else */
  if (rxInitOpts.headersInitClass) {
    args.headersInitClass = rxInitOpts.headersInitClass
  }
  delete rxInitOpts.headersInitClass

  /* istanbul ignore else */
  if (typeof rxInitOpts.keepRedirectCookies !== 'undefined') {
    args.keepRedirectCookies = !! rxInitOpts.keepRedirectCookies
  }
  delete rxInitOpts.keepRedirectCookies

  /* istanbul ignore else */
  if (typeof rxInitOpts.processData !== 'undefined') {
    args.processData = rxInitOpts.processData
  }
  delete rxInitOpts.processData

  /* istanbul ignore else */
  if (typeof rxInitOpts.timeout !== 'undefined') {
    args.timeout = rxInitOpts.timeout
  }
  delete rxInitOpts.timeout

  return {
    args,
    requestInit: { ...rxInitOpts } as RequestInit,
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

  switch (requestInit.method) {
    case 'DELETE':
    case 'POST':
    case 'PUT': {
      const headers = requestInit.headers as Headers

      if (args.contentType === false) {
        break
      }
      else if (args.contentType) {
        headers.set('Content-Type', args.contentType)
      }
      /* istanbul ignore else */
      else if (! headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded')
      }
      break
    }
  }
  return { args, requestInit }
}


/** Parse type of return data */
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
