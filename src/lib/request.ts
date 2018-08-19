import * as QueryString from 'qs'
import { defer, Observable } from 'rxjs'

import { Args } from './model'
import { buildQueryString, selectFecthModule } from './util'


/** Create Observable Request */
export function createObbRequest(
  input: Request | string,
  args: Args,
  requestInit: RequestInit,
): Observable<Response> {

  const fetchModule = selectFecthModule(args.fetchModule)

  if (typeof input === 'string') {
    /* istanbul ignore else */
    if (typeof args.data !== 'undefined') {
      if (args.processData) {
        if (['GET', 'DELETE'].includes(<string> requestInit.method)) {
          input = buildQueryString(input, args.data)
        }
        else {
          requestInit.body = QueryString.stringify(args.data)
        }
      }
      else {
        requestInit.body = <any> args.data
      }
    }

    return defer(() => fetchModule(input, requestInit))
  }
  else {
    return defer(() => fetchModule(<Request> input))
  }
}

