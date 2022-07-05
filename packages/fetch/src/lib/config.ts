import { patchedFetch, Node_Headers } from './patch.js'
import { Options } from './types.js'


export const initialOptions: Options = {
  url: '',
  dataType: 'json',
  keepRedirectCookies: false,
  method: 'GET',
  processData: true,
  timeout: Infinity,

  cache: 'default',
  credentials: 'same-origin',
  mode: 'cors',
  redirect: 'follow',
  referrer: 'client',
}

// for non-browser, like node.js
if (typeof window === 'undefined') {
  if (typeof fetch !== 'function' && patchedFetch) {
    initialOptions.fetchModule = patchedFetch
  }
  else if (process.version.startsWith('v18.') && patchedFetch) {
    initialOptions.fetchModule = patchedFetch // not use undici
  }

  if (typeof Headers !== 'function') {
    initialOptions.headersInitClass = Node_Headers
  }
}

