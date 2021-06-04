/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { join } from 'path'

import { Configuration, Inject } from '@midwayjs/decorator'
import { IMidwayWebContext } from '@midwayjs/web'


@Configuration({
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @Inject() readonly ctx: IMidwayWebContext

  async onReady(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! this.ctx.fetchRequestSpanMap) {
      this.ctx.fetchRequestSpanMap = new Map()
    }
  }

  async onStop(): Promise<void> {
    this.ctx.fetchRequestSpanMap.clear()
  }
}

