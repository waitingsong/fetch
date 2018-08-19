export function ab2str(buf: ArrayBuffer) {
  const bufView = new Uint8Array(buf)
  const len = bufView.length
  const bstr = new Array(len)
  for (let i = 0; i < len; i++) {
    bstr[i] = String.fromCharCode.call(null, bufView[i])
  }
  return bstr.join('')
}
