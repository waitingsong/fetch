import { App, Configuration } from '@midwayjs/core'
import type { Application } from '@mwcp/share'

import * as SRC from '../../../../src/index.js'


@Configuration({
  imports: [SRC],
})
export class AutoConfiguration {
  @App() readonly app: Application

  async onReady(): Promise<void> {
    // const foo = this.app.getConfig() as unknown
    // void foo
  }
}
