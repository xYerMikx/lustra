import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PrismaService } from '@/common/prisma/prisma.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  ping() {
    return { status: 'ok', ts: new Date().toISOString() }
  }

  @Get('deep')
  async deep() {
    await this.prisma.$queryRaw`SELECT 1`

    return { status: 'ok', db: 'ok', ts: new Date().toISOString() }
  }
}
