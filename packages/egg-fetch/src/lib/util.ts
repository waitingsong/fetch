import assert from 'assert'

import { initialConfig } from './config'
import { FetchConfig } from './types'


/** Generate jwtConfig with input and default value */
export function parseConfig(input: FetchConfig): FetchConfig {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  assert(input.client && Object.keys(input.client).length > 0)

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

