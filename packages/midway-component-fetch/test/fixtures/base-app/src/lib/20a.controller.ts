import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../types/api-test.js'
import { FetchService } from '../types/index.js'


@Controller(apiBase.fetch)
export class TestController {

  @Inject() private readonly fetchService: FetchService

  @Get(`/${apiMethod.after_throw}`)
  async hello(): Promise<string> {
    const url = 'http://localhost:9999' // fake url
    await this.fetchService.get<string>(url, { dataType: 'text' })
    return 'never reach here'
  }

}

