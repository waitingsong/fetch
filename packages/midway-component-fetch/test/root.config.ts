import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { Application } from '~/interface'


export type TestResponse = supertest.Response
export interface TestRespBody {
  cookies: unknown
  header: IncomingHttpHeaders
  url: string
}

export interface TestConfig {
  app: Application
  httpRequest: SuperTest<supertest.Test>
  host: string
}
export const testConfig = {
} as TestConfig

