import { assertNever } from './shared.js'
import {
  FetchMsg,
  FetchResponse,
  RespDataType,
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
      const str = `${FetchMsg.httpErrorMsgPrefix}${status}\nstatusText: ${statusText}\nResponse: ${txt}`
      const ex = new Error(str)
      return Promise.reject(ex)
    })
  return ret
}


export async function processResponseType(
  response: Response,
  dataType: RespDataType,
): Promise<FetchResponse> {

  let ret: FetchResponse

  switch (dataType) {
    case 'arrayBuffer':
      ret = await response.arrayBuffer()
      break

    case 'bare':
      ret = response
      break

    case 'blob':
      ret = await response.blob()
      break

    case 'formData':
      ret = await response.formData()
      break

    case 'json':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ret = await response.json()
      break

    case 'raw':
      ret = response
      break

    case 'text':
      ret = await response.text()
      break

    default:
      return assertNever(dataType)
  }

  return ret
}

