import { join } from 'node:path'

import 'tsconfig-paths/register'
import { Configuration, Inject } from '@midwayjs/decorator'
import * as jaeger from '@mw-components/jaeger'


@Configuration({
  imports: [
    require('../../../../src'),
    jaeger,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  @Inject() readonly jaeger: jaeger.TracerComponent
}
