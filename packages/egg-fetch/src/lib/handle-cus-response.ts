import { JsonResp } from 'rxxfetch'


/** 处理返回数据 err 值 */
export function parseRespState<T>(data: JsonResp<T>): JsonResp<T> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (! data) {
    throw new TypeError('返回数据结构非法空')
  }
  else if (typeof data.code !== 'number') {
    throw new TypeError('返回数据 err 键值非法')
  }

  return data
}


/** 分析请求结果 若异常则抛出异常 */
export function parseRespErr(data: JsonResp): void {
  if (data.code > 0) {
    throw new Error(data.msg ? data.msg : 'Fetch Error without error message')
  }
}

