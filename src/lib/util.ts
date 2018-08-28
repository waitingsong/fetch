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
    delete rxInitOpts.cookies
  }

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
  if (typeof rxInitOpts.keepRedirectCookies !== 'undefined') {
    args.keepRedirectCookies = !! rxInitOpts.keepRedirectCookies
    delete rxInitOpts.keepRedirectCookies
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


export function parseInitOpts(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  options = parseHeaders(options) // at first!

  options = parseAbortController(options)
  options = parseCookies(options)
  options = parseMethod(options)
  options.args.dataType = parseDataType(options.args.dataType)
  options.args.timeout = parseTimeout(options.args.timeout)
  options.requestInit.redirect = parseRedirect(<boolean> options.args.keepRedirectCookies, options.requestInit.redirect)

  return options
}


function parseHeaders(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  /* istanbul ignore else */
  if (args.headersInitClass) {
    const headers = requestInit.headers
      ? <Headers> new args.headersInitClass(requestInit.headers)
      : <Headers> new args.headersInitClass()
    requestInit.headers = headers
  }
  else {  // browser native
    requestInit.headers = requestInit.headers
      ? new Headers(requestInit.headers)
      : new Headers()
  }

  /* istanbul ignore else */
  if (! (<Headers> requestInit.headers).has('Accept')) {
    (<Headers> requestInit.headers).set('Accept', 'application/json, text/html, text/javascript, text/plain, */*')
  }

  return { args, requestInit }
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


function parseCookies(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options
  const data = args.cookies
  const arr = <string[]> []

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
    let cookies = (<Headers> requestInit.headers).get('Cookie')

    if (cookies) {
      cookies = cookies.trim()
      if (cookies.slice(-1) === ';') {
        cookies = cookies.slice(0, -1)
      }

      (<Headers> requestInit.headers).set('Cookie', `${cookies}; ` + arr.join('; '))
    }
    else {
      (<Headers> requestInit.headers).set('Cookie', arr.join('; '))
    }
  }

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


function parseDataType(value: any): NonNullable<Args['dataType']> {
  /* istanbul ignore else */
  if (typeof value === 'string' && ['arrayBuffer', 'bare', 'blob', 'formData', 'json', 'text', 'raw'].includes(value)) {
    return <NonNullable<Args['dataType']>> value
  }
  return 'json'
}


function parseTimeout(p: any): number | null {
  const value = typeof p === 'number' && p >= 0 ? Math.ceil(p) : null
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

  return <NonNullable<Args['fetchModule']>> fetchModule
}
