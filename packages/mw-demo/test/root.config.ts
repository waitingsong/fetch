import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { Application, MiddlewareConfig } from '~/interface'
import { Config } from '~/lib/types'


export type TestResponse = supertest.Response
export interface TestRespBody {
  config: Config
  mwConfig: MiddlewareConfig
  cookies: unknown
  header: IncomingHttpHeaders
  url: string
}

export interface TestConfig {
  config: Config
  app: Application
  httpRequest: SuperTest<supertest.Test>
  host: string
}
export const testConfig = {
} as TestConfig

