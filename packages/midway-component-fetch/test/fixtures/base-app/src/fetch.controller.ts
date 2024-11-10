import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { apiBase, apiMethod } from './types/api-test.js'
import { FetchService } from './types/index.js'


@Controller(apiBase.fetch)
export class FetchController {

  @Inject() private readonly fetchService: FetchService

  @Get(`/${apiMethod.ip}`)
  async ip(): Promise<string> {
    // {"ip_addr":"223.87.231.32","remote_host":"unavailable","user_agent":"curl/7.76.1","port":"47100","method":"GET","mime":"*/*","via":"1.1 google","forwarded":"223.87.231.32,34.160.111.145"}
    const url = 'http://ifconfig.me/all.json'

    const text = await this.fetchService.get<string>(url, { dataType: 'json' })
    let ip = ''
    if (text) {
      const arr = /([\d.]+)/ui.exec(text)
      ip = arr && arr.length >= 1 && arr[1] ? arr[1] : ''
    }
    return ip
  }

  @Get(`/${apiMethod.self}`)
  async self(): Promise<string> {
    const url = 'http://127.0.0.1:7002/fetch/hello'
    const text = await this.fetchService.get<string>(url, { dataType: 'text' })
    return text
  }

}

