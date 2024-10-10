import { UploadFileInfo, UploadMiddleware } from '@midwayjs/busboy'
import { Controller, Fields, Files, Inject, Post } from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'

import { apiBase, apiMethod } from '../types/api-test.js'


@Controller(apiBase.upload)
export class BusboyTestController {
  @Inject() private readonly traceService: TraceService

  @Post(`/${apiMethod.hello}`, { middleware: [UploadMiddleware] })
  async upload(@Files() files: UploadFileInfo[], @Fields() fields: Record<string, string>): Promise<UploadRet> {
    const traceId = this.traceService.getTraceId()
    return { files, fields, traceId }
  }

}

interface UploadRet {
  files: UploadFileInfo[]
  fields: Record<string, string>
  traceId: string
}
