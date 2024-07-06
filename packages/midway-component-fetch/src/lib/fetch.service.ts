/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from 'console'

import { Inject, Provide } from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'
import { MConfig } from '@mwcp/share'
import { Headers, ResponseData, pickUrlStrFromRequestInfo } from '@waiting/fetch'

import type { Context } from '../interface.js'

import { FetchComponent } from './fetch.component.js'
import {
  Config,
  ConfigKey,
  FetchOptions,
} from './types.js'


@Provide()
export class FetchService {

  @MConfig(ConfigKey.config) protected readonly fetchConfig: Config
  @Inject() protected readonly ctx: Context
  @Inject() protected readonly fetchComponent: FetchComponent
  @Inject() protected readonly traceService: TraceService

  async fetch<T extends ResponseData>(options: FetchOptions): Promise<T> {
    const [ret] = await this.fetch2<T>(options)
    return ret
  }

  async fetch2<T extends ResponseData>(options: FetchOptions): Promise<[T, Headers]> {
    const opts = { ...options }

    if (this.fetchConfig.enableTrace) {
      this.prepareTrace(opts)
    }

    const ret = await this.fetchComponent.fetch2<T>(opts)
    return ret
  }


  get<T extends ResponseData>(
    input: string,
    options?: Omit<FetchOptions, 'url' | 'method'>,
  ): Promise<T> {

    const opts = {
      ...options,
      url: input,
      method: 'GET',
    } as FetchOptions
    return this.fetch(opts)
  }


  post<T extends ResponseData>(
    input: string,
    options?: Omit<FetchOptions, 'url' | 'method'>,
  ): Promise<T> {

    const opts = {
      ...options,
      url: input,
      method: 'POST',
    } as FetchOptions
    return this.fetch(opts)
  }


  protected prepareTrace(options: FetchOptions): void {
    options.traceService = this.traceService
    if (! options.webContext) {
      options.webContext = this.ctx
    }

    const txt = pickUrlStrFromRequestInfo(options.url)
    if (options.traceScope) {
      assert(typeof options.traceScope === 'symbol' || typeof options.traceScope === 'object', 'opts.scope must be symbol or object')
    }
    else {
      options.traceScope = Symbol(txt)
    }
  }

}

