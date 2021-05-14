/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import { abortableFetch } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js'
import _fetch, { Headers as _Headers } from 'node-fetch'


import { RxRequestInit } from './types'


export const initialRxRequestInit: RxRequestInit = {
  dataType: 'json',
  keepRedirectCookies: false,
  method: 'GET',
  processData: true,
  timeout: null,

  cache: 'default',
  credentials: 'same-origin',
  mode: 'cors',
  redirect: 'follow',
  referrer: 'client',
}

// for node.js
if (typeof window === 'undefined') {
  if (typeof fetch !== 'function') {
    initialRxRequestInit.fetchModule = abortableFetch(_fetch).fetch
  }

  if (typeof Headers !== 'function') {
    initialRxRequestInit.headersInitClass = _Headers
  }
}


export const httpErrorMsgPrefix = 'Fetch error status:'

