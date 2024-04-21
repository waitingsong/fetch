import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { FetchService } from '../../../../dist/index.js'


@Controller('/fetch')
export class FetchController {

  @Inject() private readonly fetchService: FetchService

  @Get('/ip')
  async ip(): Promise<string> {
    const url = 'http://ifconfig.me' // 222.233.10.1

    const text = await this.fetchService.get<string>(url, { dataType: 'text' })
    let ip = ''
    if (text) {
      const arr = /([\d.]+)/ui.exec(text)
      ip = arr && arr.length >= 1 && arr[1] ? arr[1] : ''
    }
    return ip
  }

  @Get('/self')
  async self(): Promise<string> {
    const url = 'http://127.0.0.1:7002/fetch/hello'
    const text = await this.fetchService.get<string>(url, { dataType: 'text' })
    return text
  }

}

