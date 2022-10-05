import * as koa from '@midwayjs/koa'
import * as otel from '@mwcp/otel'


const CI = !! (process.env['MIDWAY_SERVER_ENV'] === 'unittest'
  || process.env['MIDWAY_SERVER_ENV'] === 'local'
  || process.env['NODE_ENV'] === 'local'
)

export const useComponents: IComponentInfo[] = [otel]
if (CI && ! useComponents.includes(koa)) {
  useComponents.push(koa)
}

export interface IComponentInfo {
  Configuration: unknown
  [key: string]: unknown
}

