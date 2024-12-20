import assert from 'node:assert'

import { Autoload, Singleton } from '@midwayjs/core'
import { Trace, TraceLog } from '@mwcp/otel'
import { MConfig } from '@mwcp/share'
import {
  Headers,
  ResponseData,
  fetch2,
  pickUrlStrFromRequestInfo,
} from '@waiting/fetch'

import { genAttrsWhileError, traceLogAfterResponse, traceLogBeforeRequest } from './helper.js'
import {
  type FetchOptions,
  type ProcessExCallbackOptions,
  type ReqCallbackOptions,
  type RespCallbackOptions,
  Config,
  ConfigKey,
} from './types.js'


@Autoload()
@Singleton()
export class FetchComponent {

  @MConfig(ConfigKey.config) protected readonly fetchConfig: Config

  async fetch<T extends ResponseData>(options: FetchOptions): Promise<T> {
    const [ret] = await this.fetch2<T>(options)
    return ret
  }

  @Trace<FetchComponent['fetch2']>({
    spanName: ([options]) => {
      const txt = pickUrlStrFromRequestInfo(options.url)
      const url = new URL(txt)
      const host = url.host.endsWith('/') ? url.host.slice(0, -1) : url.host
      const name = `HTTP ${options.method.toLocaleUpperCase()} ${host}${url.pathname}`
      return name
    },
    before([options], decoratorContext) {
      if (! this.fetchConfig.enableTrace) { return }
      const { traceSpan } = decoratorContext
      assert(traceSpan, 'traceSpan must be set')
      options.span = traceSpan
      return null
    },
    afterThrow([options], error) {
      assert(this.fetchConfig, 'this.fetchConfig undefined')
      if (! this.fetchConfig.enableTrace) { return }
      const opts: ProcessExCallbackOptions = {
        id: void 0,
        config: this.fetchConfig,
        opts: options,
        exception: error,
      }
      return genAttrsWhileError(opts)
    },
  })
  async fetch2<T extends ResponseData>(this: FetchComponent, options: FetchOptions): Promise<[T, Headers]> {
    const opts: FetchOptions = { ...options }

    const url = pickUrlStrFromRequestInfo(opts.url)
    const id = Symbol(url)
    opts.headers = this.genReqHeadersFromOptionsAndConfigCallback(
      opts,
      opts.headers,
    )
    // opts.beforeProcessResponseCallback = (input: Response) => this.cacheRespHeaders(id, input, responseHeadersMap)

    const config = this.fetchConfig
    await this.beforeRequest({
      id,
      config,
      opts,
      webContext: opts.webContext,
    })

    const opts2 = { ...opts }
    if (! this.fetchConfig.traceEvent) {
      delete opts2.span
      delete opts2.traceService
      delete opts2.traceContext
    }
    const data = await fetch2<T>(opts2)

    if (config.processResult) {
      data[0] = config.processResult({
        id,
        config,
        opts,
        resultData: data[0],
        respHeaders: data[1],
        webContext: opts.webContext,
      })
    }

    await this.afterResponse({
      id,
      config,
      opts,
      resultData: data[0],
      respHeaders: data[1],
      webContext: opts.webContext,
    })

    return data
  }


  /**
   * Duplicate key will be overwritten,
   * by headers.set() instead of headers.append()
   */
  genReqHeadersFromOptionsAndConfigCallback(
    options: FetchOptions,
    initHeaders: FetchOptions['headers'] | undefined,
  ): Headers {

    const headers = new Headers(initHeaders)
    if (typeof this.fetchConfig.genRequestHeaders !== 'function') {
      return headers
    }

    const ret = this.fetchConfig.genRequestHeaders(
      options,
      headers,
    )
    return ret
  }

  // #region private

  @TraceLog<FetchComponent['beforeRequest']>({
    before: ([options], ctx) => traceLogBeforeRequest(options, ctx),
  })
  private async beforeRequest(options: ReqCallbackOptions): Promise<void> {
    const config = this.fetchConfig
    if (config.beforeRequest) {
      await config.beforeRequest(options)
    }
  }


  @TraceLog<FetchComponent['afterResponse']>({
    after: ([options]) => traceLogAfterResponse(options),
  })
  private async afterResponse(options: RespCallbackOptions): Promise<void> {
    const config = this.fetchConfig
    if (config.afterResponse) {
      await config.afterResponse(options)
    }
  }

}

