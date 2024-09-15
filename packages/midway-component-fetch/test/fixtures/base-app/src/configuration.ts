import * as upload from '@midwayjs/busboy'
import { App, Configuration } from '@midwayjs/core'
import type { Application } from '@mwcp/share'

import * as SRC from './types/index.js'


@Configuration({
  imports: [SRC, upload],
})
export class AutoConfiguration {

  @App() readonly app: Application

  async onReady(): Promise<void> {
    // const foo = this.app.getConfig() as unknown
    // void foo
  }

}
