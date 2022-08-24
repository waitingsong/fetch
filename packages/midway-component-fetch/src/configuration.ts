import 'tsconfig-paths/register'

import { join } from 'path'

import { Configuration, Inject } from '@midwayjs/decorator'
import * as jaeger from '@mw-components/jaeger'

import { ConfigKey } from './lib/index'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: [jaeger],
})
export class AutoConfiguration {

  @Inject() readonly jaeger: jaeger.TracerComponent

}

