/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type AsyncContextManager,
  ApplicationContext,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
  Inject,
  Singleton,
} from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'
import { MConfig } from '@mwcp/share'
import { type FormData, Headers, ResponseData } from '@waiting/fetch'

import type { Context, IMidwayContainer } from '../interface.js'

import { FetchComponent } from './fetch.component.js'
import {
  type Config,
  type FetchOptions,
  ConfigKey,
} from './types.js'


@Singleton()
export class FetchService {

  @MConfig(ConfigKey.config) protected readonly fetchConfig: Config
  @ApplicationContext() readonly applicationContext: IMidwayContainer
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


  postFormWithFile<T extends ResponseData>(
    input: string,
    formData: FormData,
    options?: Omit<FetchOptions, 'url' | 'method' | 'body'>,
  ): Promise<T> {

    const opts = {
      ...options,
      url: input,
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
    } as FetchOptions
    return this.fetch(opts)
  }

  // #region protected

  protected prepareTrace(options: FetchOptions): void {
    options.traceService = this.traceService
    if (! options.webContext) {
      options.webContext = this.getWebContext()
    }

    this.fetchComponent.prepareTrace(options)
  }

  protected getWebContext(): Context | undefined {
    try {
      const contextManager: AsyncContextManager = this.applicationContext.get(
        ASYNC_CONTEXT_MANAGER_KEY,
      )
      const ctx = contextManager.active().getValue(ASYNC_CONTEXT_KEY) as Context | undefined
      return ctx
    }
    catch (ex) {
      void ex
      // console.warn(new Error('getWebContext() failed', { cause: ex }))
    }
  }
}

