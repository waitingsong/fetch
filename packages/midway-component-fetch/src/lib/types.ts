/* eslint-disable node/no-unpublished-import */
import type { Context } from 'egg'


export interface FetchConfig {
  /**
   * Generate headersInit from request context for Fetch request
   *
   * @default customGenReqHeadersInit()
   */
  genReqHeadersInit: (
    ctx: Context,
    headersInit?: Record<string, string>,
  ) => Headers
}

