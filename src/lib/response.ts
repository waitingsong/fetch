import { assertNeverRx } from '@waiting/shared-core'
import { defer, of, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { httpErrorMsgPrefix } from './config'
import { Args, JsonType, RespDataType, RxRequestInit } from './model'


export function handleResponseError(resp: Response, bare: boolean = false): Observable<Response> {
  /* istanbul ignore else */
  if (resp.ok || bare) {
    return of(resp)
  }
  const { status, statusText } = resp

  return defer(() => resp.text()).pipe(
    catchError((err: Error) => of(err.toString())),
    map((txt: string) => {
      const str = `${ httpErrorMsgPrefix }${ status }\nstatusText: ${statusText}\nResponse: ${txt}`
      throw new Error(str)
    }),
  )
}

export function parseResponseType<T extends NonNullable<RxRequestInit['dataType']>>(
  response: Response,
  dataType: T,
): Observable<RespDataType[T]> {

  switch (dataType) {
    case 'arrayBuffer':
      return defer(() => response.arrayBuffer())

    case 'bare':
      return of(response)

    case 'blob':
      return defer(() => response.blob())

    case 'formData':
      return defer(() => response.formData())

    case 'json':
      return <Observable<JsonType>> defer(() => response.json())

    case 'raw':
      return of(response)

    case 'text':
      return defer(() => response.text())

    default:
      return assertNeverRx(<never> dataType)
  }
}


/** "foo=cookiefoo; Secure; Path=/" */
export function parseRespCookie(cookie: string | null): Args['cookies'] {
  /* istanbul ignore else  */
  if (!cookie) {
    return
  }
  const arr = cookie.split(/;/)
  const ret: Args['cookies'] = {}

  for (let row of arr) {
    row = row.trim()
    /* istanbul ignore else  */
    if (!row) {
      continue
    }
    if (!row.includes('=')) {
      continue
    }
    if (row.slice(0, 5) === 'Path=') {
      continue
    }
    const [key, value] = row.split('=')
    ret[key] = value
  }

  /* istanbul ignore else  */
  if (ret && Object.keys(ret).length) {
    return ret
  }
}
