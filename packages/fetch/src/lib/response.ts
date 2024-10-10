import assert from 'node:assert'

import type { JsonObject } from '@waiting/shared-types'
import type { Response } from 'undici'

import type {
  ResponseProcessNameKeys,
  ResponseRawKeys,
} from './types.js'
import {
  FetchMsg,
  FnKeys,
} from './types.js'


export async function handleResponseError(
  resp: Response,
  bare = false,
): Promise<Response> {

  /* istanbul ignore else */
  if (resp.ok || bare) {
    return resp
  }

  const { status, statusText } = resp
  const ret = resp.text()
    .catch((err: Error) => JSON.stringify(err))
    .then((txt) => {
      const str = `${FetchMsg.httpErrorMsgPrefix}${status.toString()}\nstatusText: ${statusText}\nResponse: ${txt}`
      const ex = new Error(str)
      return Promise.reject(ex)
    })
  return ret
}

type ProcessResponseTypeReturnType<K extends (ResponseProcessNameKeys | ResponseRawKeys)> =
  K extends ResponseRawKeys
    ? Response
    : K extends ResponseProcessNameKeys
      ? (Response[K] extends (...args: unknown[])
        => Promise<infer R> ? unknown extends R ? JsonObject : R : never)
      : never

export async function processResponseType<K extends (
  ResponseProcessNameKeys | ResponseRawKeys)>(
  response: Response,
  dataType: K,
): Promise<ProcessResponseTypeReturnType<K>> {

  if (['raw', 'bare'].includes(dataType)) {
    return response as ProcessResponseTypeReturnType<K>
  }

  assert(dataType in FnKeys, `dataType: ${dataType} is not in ${Object.keys(FnKeys).join(', ')}`)
  assert(typeof response[dataType as keyof Response] === 'function', `response.${dataType} is not a function`)
  // @ts-expect-error
  const ret = await response[dataType as keyof Response]() as Promise<ProcessResponseTypeReturnType<K>>
  return ret
}

