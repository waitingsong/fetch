import * as assert from 'assert'

import { FetchConfig } from './model'
import { initialConfig } from './config'


/** Generate jwtConfig with input and default value */
export function parseConfig(input: FetchConfig): FetchConfig {
  assert(input && input.client && Object.keys(input.client).length > 0)

  const config: FetchConfig = {
    agent: initialConfig.agent,
    app: initialConfig.app,
    client: { ...input.client },
  }

  /* istanbul ignore else */
  if (typeof input.agent === 'boolean') {
    config.agent = input.agent
  }

  /* istanbul ignore else */
  if (typeof input.app === 'boolean') {
    config.app = input.app
  }

  return config
}

