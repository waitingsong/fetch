/* eslint-disable node/no-unpublished-import */
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
}

