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

export const httpErrorMsgPrefix = 'Fetch error status:'
