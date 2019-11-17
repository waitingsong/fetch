// @ts-ignore
// eslint-disable-next-line
import { abortableFetch } from 'abortcontroller-polyfill/dist/cjs-ponyfill.js' // tslint:disable-line
import _fetch, { Headers as _Headers } from 'node-fetch'

import { RxRequestInit } from './model'


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
