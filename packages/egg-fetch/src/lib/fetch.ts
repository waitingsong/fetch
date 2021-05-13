/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NEVER } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import {
  JsonResp,
  RxRequestInit,
  get as rxget,
  post as rxpost,
  put as rxput,
  remove as rxremove,
  ObbRetType,
  FetchResult,
} from 'rxxfetch'

import { parseRespState, parseRespErr } from './handle-cus-response'
import { FetchEggConfig } from './types'


export class Fetch {

  private readonly config: FetchEggConfig['client']

  constructor(config: FetchEggConfig['client']) {
    this.config = { ...config }
  }

  /**
   * Fetch GET 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public get<T extends ObbRetType = any>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<T> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return rxget<T>(url, args)
  }


  /**
   * Fetch POST 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public post<T extends ObbRetType = any>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<T> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return rxpost<T>(url, args)
  }


  /**
   * Fetch PUT 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public put<T extends ObbRetType = any>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<T> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return rxput<T>(url, args)
  }


  /**
   * Fetch REMOVE 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public remove<T extends ObbRetType = any>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<T> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return rxremove<T>(url, args)
  }


  /* --------------- Response with Custom data structure JsonResp<TDat> ----------- */

  /**
   * Fetch GET 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 unknown
   */
  public xget<TDat = unknown>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<JsonResp<TDat>> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return fetchJsonResp<TDat>(url, args, 'get')
  }


  /**
   * Fetch POST 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public xpost<TDat = unknown>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<JsonResp<TDat>> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return fetchJsonResp<TDat>(url, args, 'post')
  }


  /**
   * Fetch PUT 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public xput<TDat = unknown>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<JsonResp<TDat>> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return fetchJsonResp<TDat>(url, args, 'put')
  }


  /**
   * Fetch REMOVE 返回数据类型固定为 json
   * @returns Observable<JsonResp<T>> 泛型T为 Resp.dat 的类型，默认 any
   */
  public xremove<TDat = unknown>(
    url: string,
    init?: RxRequestInit,
  ): FetchResult<JsonResp<TDat>> {

    const args = init ? { ...this.config, ...init } : { ...this.config }
    return fetchJsonResp<TDat>(url, args, 'remove')
  }

}


function fetchJsonResp<TDat>(
  url: string,
  init: RxRequestInit,
  type: 'get' | 'post' | 'put' | 'remove',
): FetchResult<JsonResp<TDat>> {

  let req$: FetchResult<JsonResp<TDat>>

  switch (type) {
    case 'get':
      req$ = rxget(url, init)
      break
    case 'post':
      req$ = rxpost(url, init)
      break
    case 'put':
      req$ = rxput(url, init)
      break
    case 'remove':
      req$ = rxremove(url, init)
      break
    default:
      return NEVER
  }

  const ret$ = req$.pipe(
    // @ts-expect-error
    map((value: JsonResp<TDat>) => parseRespState(value)),
    tap(res => parseRespErr(res)),
  )

  return ret$ as FetchResult<JsonResp<TDat>>
}

