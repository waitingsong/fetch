import 'tsconfig-paths/register'

import { join } from 'path'

import { Configuration } from '@midwayjs/decorator'

import { ConfigKey } from '~/index'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
}

