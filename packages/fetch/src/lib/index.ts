
export {
  fetch,
  fetch2,
  get,
  post,
  remove,
  put,
} from './fetch.js'
// export * from './config.js'
export * from './types.js'
export {
  buildQueryString,
  getGloalRequestOptions,
  pickUrlStrFromRequestInfo,
  setGloalRequestOptions,
} from './util.js'

export {
  FormData,
  Headers,
  HeadersInit,
  Response,
  RequestInfo,
  RequestInit,
} from 'undici'

