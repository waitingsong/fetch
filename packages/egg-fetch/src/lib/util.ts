/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { initialClientOptions, initialConfig } from './config'
import { ClientOptions, EggPluginConfig } from './types'


export function parseConfig(input: any): EggPluginConfig {
  const config = {
    client: parseOptions(input.client),

    appWork: typeof input.appWork === 'boolean'
      ? input.appWork
      : initialConfig.appWork,

    agent: typeof input.agent === 'boolean'
      ? input.agent
      : initialConfig.agent,

    enable: typeof input.enable === 'boolean'
      ? input.enable
      : initialConfig.enable,

    ignore: typeof input.ignore === 'undefined'
      ? initialConfig.ignore
      : input.ignore,

    match: typeof input.match === 'undefined'
      ? initialConfig.match
      : input.match,

    appMiddlewareIndex: typeof input.appMiddlewareIndex === 'number'
      ? input.appMiddlewareIndex
      : initialConfig.appMiddlewareIndex,
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

