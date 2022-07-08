import {
  Config as _Config,
  Controller,
  Get,
} from '@midwayjs/decorator'

import { TestRespBody } from '@/root.config'
import { Context } from '~/interface'
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from '~/index'


@Controller('/')
export class HomeController {

  @_Config(ConfigKey.config) protected readonly config: Config
  @_Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Get('/')
  async home(ctx: Context): Promise<TestRespBody> {
    const {
      cookies, 
      header, 
      url,
    } = ctx
    const config = this.config
    const mwConfig = this.mwConfig
    const res = {
      config,
      mwConfig,
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

