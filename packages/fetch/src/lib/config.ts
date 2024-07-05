import type { Options } from './types.js'


export const initialOptions: Options = {
  url: '',
  dataType: 'json',
  keepRedirectCookies: false,
  method: 'GET',
  processData: true,
  timeout: Infinity,

  // cache: 'default',
  credentials: 'same-origin',
  mode: 'cors',
  redirect: 'follow',
}

