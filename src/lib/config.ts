import { RxRequestInit } from './model'


export const initialRxRequestInit: RxRequestInit = {
  dataType: 'json',
  method: 'GET',
  processData: true,
  timeout: null,
  throwErrorIfHigher400: true,

  cache: 'no-cache',
  credentials: 'same-origin',
  mode: 'cors',
  redirect: 'follow',
  referrer: 'client',
}
