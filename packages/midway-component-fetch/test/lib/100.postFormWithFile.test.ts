import assert from 'node:assert'
import { Blob as NodeBlob } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { UploadFileInfo } from '@midwayjs/busboy'
import { fileShortPath, genCurrentDirname } from '@waiting/shared-core'

import { FormData, FetchService } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const currDir = genCurrentDirname(import.meta.url)

const fileName = 'loading-1.gif'
const fileType = 'image/gif'
const imgPath = join(currDir, '../images', fileName)
const buf = await readFile(imgPath)
const blob = typeof Blob === 'undefined'
  ? new NodeBlob([buf], { type: fileType })
  : new Blob([buf], { type: fileType })
// const base64 = buf.toString('base64')

describe(fileShortPath(import.meta.url), () => {

  const path = `${apiBase.upload}/${apiMethod.hello}`.slice(1)
  const formData = new FormData()
  const rndStr = Math.random().toString(36).slice(2)
  formData.append('name', rndStr)
  formData.append('uploadFile', blob, 'loading-1.gif')

  it('postFormWithFile()', async () => {
    const { app, host } = testConfig
    const fetchService = await app.getApplicationContext().getAsync(FetchService)

    const url = `${host}${path}`
    const resp = await fetchService.postFormWithFile<UploadRet>(url, formData)
    assert(resp)

    assert(resp.fields)
    assert(resp.fields.name === rndStr)

    assert(resp.files.length === 1)
    const file = resp.files[0]
    assert(file)
    assert(file.filename === fileName)
    assert(file.mimeType === fileType)
    const buf2 = await readFile(file.data)
    assert(buf2.equals(buf))
  })

})


interface UploadRet {
  fields: Record<string, string>
  files: UploadFileInfo[]
}
