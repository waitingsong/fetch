import { initialRxRequestInit } from './config'
import { Args, ArgsRequestInitCombined, RxRequestInit } from './model'


export function parseInitOpts(init?: RxRequestInit): ArgsRequestInitCombined {
  const initOpts: RxRequestInit = init ? { ...initialRxRequestInit, ...init } : { ...initialRxRequestInit }
  let options = splitInitArgs(initOpts)

  options = parseHeaders(options) // at first!

  options = parseAbortController(options)
  options = paraseCookies(options)
  options = parseMethod(options)
  options.args.dataType = parseDataType(options.args.dataType)
  options.args.timeout = parseTimeout(options.args.timeout)

  return options
}


/** Split RxRequestInit object to RequestInit and Args */
function splitInitArgs(rxInitOpts: RxRequestInit): ArgsRequestInitCombined {
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


function parseHeaders(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options

  if (args.headersInitClass) {
    let headers = <Headers> new args.headersInitClass()

    if (requestInit.headers) {
      const obj = Object.getOwnPropertyDescriptor(requestInit.headers, 'has')
      // Headers instance
      if (typeof Headers !== 'undefined' && requestInit.headers instanceof Headers) {
        const reqHeader = requestInit.headers

        // @ts-ignore for karma
        for (const [key, value] of reqHeader.entries()) {
          headers.set(key, value)
        }
      }
      // Headers instance
      else if (obj && typeof obj.value === 'function') {
        const reqHeader = <Headers> requestInit.headers

        // @ts-ignore for karma
        for (const [key, value] of reqHeader.entries()) {
          headers.set(key, value)
        }
      }
      else {  // key:value|array
        headers = new args.headersInitClass(requestInit.headers)
      }
    }
    requestInit.headers = headers
  }
  else {  // browser native
    if (requestInit.headers) {
      /* istanbul ignore else */
      // @ts-ignore
      if (typeof requestInit.headers.has !== 'function') { // key:value|array
        requestInit.headers = new Headers(requestInit.headers)
      }
    }
    else {
      requestInit.headers = new Headers()
    }
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


function paraseCookies(options: ArgsRequestInitCombined): ArgsRequestInitCombined {
  const { args, requestInit } = options
  const data = args.cookies
  const arr = <string[]> []

  if (data && typeof data === 'object') {
    for (let [key, value] of Object.entries(data)) {
      if (key && typeof key === 'string') {
        key = key.trim()
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


function parseDataType(value: any): Required<Args['dataType']> {
  /* istanbul ignore else */
  if (typeof value === 'string' && ['arrayBuffer', 'blob', 'formData', 'json', 'text', 'raw'].includes(value)) {
    return <Args['dataType']> value
  }
  return 'json'
}


function parseTimeout(p: any): number | null {
  const value = typeof p === 'number' && p >= 0 ? Math.ceil(p) : null
  return value === null || ! Number.isSafeInteger(value) ? null : value
}
