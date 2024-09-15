import { Blob as NodeBlob } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { genCurrentDirname } from '@waiting/shared-core'


const currDir = genCurrentDirname(import.meta.url)

const fileName = 'loading-1.gif'
const fileType = 'image/gif'
const imgPath = join(currDir, '../images', fileName)
const buf = await readFile(imgPath)
export const imgBlob = typeof Blob === 'undefined'
  ? new NodeBlob([buf], { type: fileType })
  : new Blob([buf], { type: fileType })

