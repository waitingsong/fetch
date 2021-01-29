import { defer, of, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { httpErrorMsgPrefix } from './config'
import { Args, ObbRetType, RespDataType, RespDataTypeName } from './model'
import { assertNeverRx } from './shared'


export function handleResponseError(resp: Response, bare = false): Observable<Response> {
  /* istanbul ignore else */
  if (resp.ok || bare) {
    return of(resp)
  }
  const { status, statusText } = resp

  return defer(() => resp.text()).pipe(
    catchError((err: Error) => of(JSON.stringify(err))),
    map((txt: string) => {
      const str = `${httpErrorMsgPrefix}${status}\nstatusText: ${statusText}\nResponse: ${txt}`
      throw new Error(str)
    }),
  )
}


export function parseResponseType<T extends RespDataTypeName>(
  response: Response,
  dataType: T,
): Observable<RespDataType[T]> {

  let ret: Observable<ObbRetType>

  switch (dataType) {
    case 'arrayBuffer':
      ret = defer(() => response.arrayBuffer())
      break

    case 'bare':
      ret = of(response)
      break

    case 'blob':
      ret = defer(() => response.blob())
      break

    case 'formData':
      ret = defer(() => response.formData())
      break

    case 'json':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ret = defer(() => response.json())
      break

    case 'raw':
      ret = of(response)
      break

    case 'text':
      ret = defer(() => response.text())
      break

    default:
      return assertNeverRx(dataType as never)
  }

  return ret as Observable<RespDataType[T]>
}


/** "foo=cookiefoo; Secure; Path=/" */
export function parseRespCookie(cookie: string | null): Args['cookies'] {
  /* istanbul ignore else  */
  if (! cookie) {
    return
  }
  // eslint-disable-next-line require-unicode-regexp
  const arr = cookie.split(/;/)
  const ret: Args['cookies'] = {}

  for (let row of arr) {
    row = row.trim()
    /* istanbul ignore else  */
    if (! row) {
      continue
    }
    if (! row.includes('=')) {
      continue
    }
    if (row.startsWith('Path=')) {
      continue
    }
    const [key, value] = row.split('=')
    ret[key] = value
  }

  /* istanbul ignore else  */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ret && Object.keys(ret).length) {
    return ret
  }
}
