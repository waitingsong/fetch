import { defer, of, Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { httpErrorMsgPrefix } from './config'
import { ObbRetType, RxRequestInit } from './model'
import { assertNever } from './shared'


export function handleResponseError(resp: Response): Observable<Response> {
  /* istanbul ignore else */
  if (resp.ok) {
    return of(resp)
  }
  const status = resp.status

  return defer(() => resp.text()).pipe(
    catchError((err: Error) => of(err ? err.toString() : 'unknow error')),
    map((txt: string) => {
      throw new Error(`${ httpErrorMsgPrefix }${ status }\nResponse: ` + txt)
    }),
  )
}


export function parseResponseType(response: Response, dataType: RxRequestInit['dataType']): Observable<ObbRetType> {
  /* istanbul ignore else  */
  if (dataType) {
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
        assertNever(dataType)
    }
  }
  return of(response)
}
