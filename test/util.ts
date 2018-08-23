/* istanbul ignore next  */
export function ab2str(buf: ArrayBuffer) {
  const bufView = new Uint8Array(buf)
  const len = bufView.length
  const bstr = new Array(len)
  for (let i = 0; i < len; i++) {
    bstr[i] = String.fromCharCode.call(null, bufView[i])
  }
  return bstr.join('')
}

/* istanbul ignore next  */
/** string to ArrayBuffer */
export function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length * 2)
  const bufView = new Uint16Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

/* istanbul ignore next  */
/** string to Uint8ArrayBuffer */
export function str2u8ab(s: string): Uint8Array {
  const buf = new ArrayBuffer(s.length)

  if (buf.byteLength !== s.length) {
    throw new Error('alloc memory error bytesize:' + s.length + ',' + buf.byteLength)
  }
  const bufView = new Uint8Array(buf)

  for (let i = 0, len = s.length; i < len; i++) {
    // tslint:disable:no-bitwise
    bufView[i] = s.charCodeAt(i) & 0xFF
  }

  return bufView
}
