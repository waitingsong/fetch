/* eslint-disable node/no-unpublished-import */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { Config, Inject, Provide } from '@midwayjs/decorator'
import {
  FetchResponse,
  Options,
  fetch,
  Node_Headers,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'
import type { Context } from 'egg'


import { FetchComponentConfig } from './types'


@Provide()
export class FetchService {

  @Inject() readonly ctx: Context

  @Config('fetch') readonly fetchConfig: FetchComponentConfig

  headers: Record<string, string> = {}


  async fetch<T extends FetchResponse = any>(
    options: Options,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = { ...options }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    if (this.fetchConfig.beforeRequest) {
      await this.fetchConfig.beforeRequest(this.ctx, opts)
    }

    const ret = await fetch<T>(opts)

    if (this.fetchConfig.afterResponse) {
      await this.fetchConfig.afterResponse(this.ctx, opts)
    }

    return ret
  }


  async get<T extends FetchResponse = any>(
    input: string,
    options?: Omit<Options, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = {
      ...options,
      url: input,
      method: 'GET',
    }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    if (this.fetchConfig.beforeRequest) {
      await this.fetchConfig.beforeRequest(this.ctx, opts)
    }

    const ret = await fetch<T>(opts)

    if (this.fetchConfig.afterResponse) {
      await this.fetchConfig.afterResponse(this.ctx, opts)
    }

    return ret
  }


  async post<T extends FetchResponse = any>(
    input: string,
    options?: Omit<Options, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = {
      ...options,
      url: input,
      method: 'POST',
    }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    if (this.fetchConfig.beforeRequest) {
      await this.fetchConfig.beforeRequest(this.ctx, opts)
    }

    const ret = await fetch<T>(opts)

    if (this.fetchConfig.afterResponse) {
      await this.fetchConfig.afterResponse(this.ctx, opts)
    }

    return ret
  }


  genReqHeadersFromOptionsAndConfigCallback(
    initHeaders: Options['headers'],
  ): Headers {

    const headers = new Node_Headers(initHeaders)
    const newHeaders = this.fetchConfig.genRequestHeaders(this.ctx, this.headers)
    newHeaders.forEach((value, key) => {
      headers.append(key, value)
    })
    return headers
  }

}

