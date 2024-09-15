import type { UploadFileInfo } from '@midwayjs/busboy'


export interface UploadRet {
  fields: Record<string, string>
  files: UploadFileInfo[]
  traceId: string
}
