/* eslint-disable node/no-unpublished-import */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { Config, Inject, Provide } from '@midwayjs/decorator'
import {
  FetchResponse,
  Options,
  fetch,
} from '@waiting/fetch'
import { OverwriteAnyToUnknown } from '@waiting/shared-types'
import type { Context } from 'egg'

import { FetchConfig } from './types'


@Provide()
export class FetchService {

  @Inject() readonly ctx: Context

  @Config() readonly fetchConfig: FetchConfig

  headers: Record<string, string> = {}


  fetch<T extends FetchResponse = any>(
    options: Options,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = { ...options }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    const ret$ = fetch<T>(opts)
    return ret$
  }


  get<T extends FetchResponse = any>(
    input: string,
    options?: Omit<Options, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = {
      ...options,
      url: input,
      method: 'GET',
    }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    const ret$ = fetch<T>(opts)
    return ret$
  }


  post<T extends FetchResponse = any>(
    input: string,
    options?: Omit<Options, 'url' | 'method'>,
  ): Promise<OverwriteAnyToUnknown<T>> {

    const opts: Options = {
      ...options,
      url: input,
      method: 'POST',
    }
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(opts.headers)

    const ret$ = fetch<T>(opts)
    return ret$
  }


  genReqHeadersFromOptionsAndConfigCallback(
    initHeaders: Options['headers'],
  ): Headers {

    const headers = new Headers(initHeaders)
    const newHeaders = this.fetchConfig.genReqHeadersInit(this.ctx, this.headers)
    newHeaders.forEach((value, key) => {
      headers.append(key, value)
    })
    return headers
  }

}

