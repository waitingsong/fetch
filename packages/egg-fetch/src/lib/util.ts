import assert from 'assert'

import {
  initialClientOptions,
  initialEggConfig,
} from './config'
import {
  ClientOptions,
  FetchEggConfig,
} from './types'


/** Generate Config with input and default value */
export function parseConfig(input: FetchEggConfig): FetchEggConfig {
  const config = {
    client: parseOptions(input.client),
  } as FetchEggConfig

  config.appWork = typeof input.appWork === 'boolean'
    ? input.appWork
    : initialEggConfig ? !! initialEggConfig.appWork : true

  config.agent = typeof input.agent === 'boolean'
    ? input.agent
    : initialEggConfig ? !! initialEggConfig.agent : false

  config.enable = typeof input.enable === 'boolean'
    ? input.enable
    : initialEggConfig.enable

  config.ignore = typeof input.ignore === 'undefined'
    ? initialEggConfig.ignore
    : input.ignore

  config.match = typeof input.match === 'undefined'
    ? initialEggConfig.match
    : input.match

  config.appMiddlewareIndex = typeof input.appMiddlewareIndex === 'number'
    ? input.appMiddlewareIndex
    : initialEggConfig.appMiddlewareIndex

  return config
}

/** Generate Options with input and default value */
export function parseOptions(client?: ClientOptions): ClientOptions {
  const opts = {
    ...initialClientOptions,
    ...client,
  }

  assert(opts)
  return opts
}

