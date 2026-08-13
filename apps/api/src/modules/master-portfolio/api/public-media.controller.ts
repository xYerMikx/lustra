import { Controller, Get, Param, Res } from '@nestjs/common'
import type { FastifyReply } from 'fastify'

import { GetPublicMediaUseCase } from '@/modules/master-portfolio/app/get-public-media.usecase'

@Controller('media')
export class PublicMediaController {
  constructor(private readonly getMedia: GetPublicMediaUseCase) {}

  @Get(':ownerId/:fileName')
  async get(
    @Param('ownerId') ownerId: string,
    @Param('fileName') fileName: string,
    @Res() reply: FastifyReply,
  ) {
    const file = await this.getMedia.execute(ownerId, fileName)

    return reply
      .header('Cache-Control', 'public, max-age=86400, immutable')
      .type(file.mimeType)
      .send(file.bytes)
  }
}
