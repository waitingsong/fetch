/* eslint-disable node/no-unpublished-import */
import { Options } from '@waiting/fetch'
import type { Context } from 'egg'


export interface FetchComponentConfig {
  /**
   * Generate headersInit from request context for Fetch request
   *
   * @default customGenReqHeadersInit()
   */
  genRequestHeaders: (
    ctx: Context,
    headersInit?: Record<string, string>,
  ) => Headers
  beforeRequest?: (ctx: Context, options: Options) => Promise<void>
  afterResponse?: (ctx: Context, options: Options) => Promise<void>
}

