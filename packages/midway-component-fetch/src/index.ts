// @ts-expect-error
import type { Context } from '@midwayjs/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import type { Span } from 'opentracing'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'

export {
  Options,
  Node_Headers,
  initialOptions,
  FetchResponse,
  JsonResp,
  JsonType,
} from '@waiting/fetch'


declare module '@midwayjs/core' {
  interface Context {
    fetchRequestSpanMap: Map<string | symbol, Span>
  }
}

