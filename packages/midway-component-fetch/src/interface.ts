import { IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'

import { FetchComponentConfig } from './lib/types'



declare module '@midwayjs/core' {
  interface Application{
    fetch: FetchComponentConfig
  }
}

export {
  IMidwayApplication as Application,
  IMiddleware, NextFunction,
} from '@midwayjs/core'
export type Context = IMidwayContext<KoaContext>

export { NpmPkg } from '@waiting/shared-types'
