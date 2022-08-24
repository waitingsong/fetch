import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator'

import {
  FetchComponent,
} from '~/index'


@Controller('/fetch')
export class FetchController {

  @Inject() private readonly fetchService: FetchComponent

  @Get('/ip')
  async ip(): Promise<string> {
    // const url = 'http://ip.360.cn/IPShare/info'
    const url = 'https://www.taobao.com/help/getip.php'
    // ipCallback({ip:"222.233.10.1"})
    const text = await this.fetchService.get<string>(url, { dataType: 'text' })
    let ip = ''
    if (text) {
      const arr = /"([\d.]+)"/ui.exec(text)
      ip = arr && arr.length >= 1 && arr[1] ? arr[1] : ''
    }
    return ip
  }

}

