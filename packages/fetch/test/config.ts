
export const HOST = process.env['HTTPBIN_HOST']
  ? 'http://' + process.env['HTTPBIN_HOST']
  : 'https://httpbin.org'

export const DELAY = process.env['HTTPBIN_HOST'] ? 100 : 2000

console.log({ HOST })

export const HOST_GET = `${HOST}/get`
export const HOST_POST = `${HOST}/post`
export const HOST_REDIRECT = `${HOST}/redirect`
export const HOST_REDIRECT_TO = `${HOST}/redirect-to`
export const HOST_ABSOLUTE_REDIRECT = `${HOST}/absolute-redirect`
export const HOST_STATUS = `${HOST}/status`
export const HOST_COOKIES = `${HOST}/cookies`
export const HOST_DELETE = `${HOST}/delete`
export const HOST_PUT = `${HOST}/put`

