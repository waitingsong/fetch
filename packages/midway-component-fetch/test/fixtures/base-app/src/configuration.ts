import 'tsconfig-paths/register'
import { Configuration } from '@midwayjs/decorator'


@Configuration({
  imports: [
    require('../../../../src'),
  ],
})
export class AutoConfiguration {
}
