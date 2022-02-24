import 'tsconfig-paths/register'

import { join } from 'path'

import { Configuration } from '@midwayjs/decorator'


const namespace = 'fetch'

@Configuration({
  namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
}

