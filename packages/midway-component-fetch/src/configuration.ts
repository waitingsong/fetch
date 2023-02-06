/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import assert from 'assert'
import { join } from 'path'

import { ILifeCycle } from '@midwayjs/core'
import { App, Configuration } from '@midwayjs/core'

import { useComponents } from './imports'
import { Application } from './interface'
import { ConfigKey, FetchComponent } from './lib/index'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() protected readonly app: Application

  async onReady(): Promise<void> {
    assert(this.app, 'this.app must be set')
    const fetch = await this.app.getApplicationContext().getAsync(FetchComponent)
    assert(fetch)
  }

}

