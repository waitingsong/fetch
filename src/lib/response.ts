import { defer, of, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { httpErrorMsgPrefix } from './config'
import { Args, ObbRetType, RxRequestInit } from './model'
import { assertNever } from './shared'


export function handleResponseError(resp: Response): Observable<Response> {
  /* istanbul ignore else */
  if (resp.ok) {
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


export function parseResponseType(
  response: Response,
  dataType: NonNullable<RxRequestInit['dataType']>,
): Observable<ObbRetType> {

  switch (dataType) {
    case 'arrayBuffer':
      return defer(() => response.arrayBuffer())

    case 'blob':
      return defer(() => response.blob())

    case 'formData':
      return defer(() => response.formData())

    case 'json':
      return <Observable<object>> defer(() => response.json())

    case 'raw':
      return of(response)

    case 'text':
      return defer(() => response.text())

    default:
      return assertNever(dataType)
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
