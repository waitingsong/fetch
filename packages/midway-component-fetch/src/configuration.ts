/* eslint-disable import/max-dependencies */
import {
  Configuration,
  ILifeCycle,
  ILogger,
  Logger,
} from '@midwayjs/core'
import { TraceInit } from '@mwcp/otel'

import * as DefaultConfig from './config/config.default.js'
// import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import {
  // Config as Conf,
  ConfigKey,
  // MiddlewareConfig,
} from './lib/types.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefaultConfig,
      // local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @Logger() protected readonly logger: ILogger

  @TraceInit({ namespace: ConfigKey.componentName })
  async onReady(): Promise<void> {
    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }

}

