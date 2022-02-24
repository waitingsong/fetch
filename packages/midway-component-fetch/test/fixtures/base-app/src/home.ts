/* eslint-disable node/no-unpublished-import */
import {
  Controller,
  Get,
  // Inject,
} from '@midwayjs/decorator'

import { Context } from '../../../../src/interface'
// import { FetchComponent } from '../../../../src/index'
import { TestRespBody } from '../../../root.config'


@Controller('/')
export class HomeController {

  // @Inject('fetch:fetchComponent') private readonly fetchService: FetchComponent

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const { cookies, header, url } = ctx
    const res = {
      cookies,
      header,
      url,
    }
    return res
  }

  // @Get('/ip')
  // async ip(): Promise<string> {
  //   // const url = 'http://ip.360.cn/IPShare/info'
  //   const url = 'https://www.taobao.com/help/getip.php'
  //   // ipCallback({ip:"222.233.10.1"})
  //   const text = await this.fetchService.get<string>(url)
  //   let ip = ''
  //   if (text) {
  //     const arr = /"([\d.]+)"/ui.exec(text)
  //     ip = arr && arr.length >= 1 && arr[1] ? arr[1] : ''
  //   }
  //   return ip
  // }

}

