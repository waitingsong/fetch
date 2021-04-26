/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { initialClientOptions, initialEggConfig } from './config'
import { ClientOptions, EggPluginConfig } from './types'


export function parseConfig(input: any): EggPluginConfig {
  const config = {
    client: parseOptions(input.client),

    appWork: typeof input.appWork === 'boolean'
      ? input.appWork
      : initialEggConfig.appWork,

    agent: typeof input.agent === 'boolean'
      ? input.agent
      : initialEggConfig.agent,

    enable: typeof input.enable === 'boolean'
      ? input.enable
      : initialEggConfig.enable,

    ignore: typeof input.ignore === 'undefined'
      ? initialEggConfig.ignore
      : input.ignore,

    match: typeof input.match === 'undefined'
      ? initialEggConfig.match
      : input.match,

    appMiddlewareIndex: typeof input.appMiddlewareIndex === 'number'
      ? input.appMiddlewareIndex
      : initialEggConfig.appMiddlewareIndex,
  }

  return config
}

/** Generate Options with input and default value */
export function parseOptions(client?: ClientOptions): ClientOptions {
  const opts = {
    ...initialClientOptions,
    ...client,
  } as ClientOptions

  return opts
}

