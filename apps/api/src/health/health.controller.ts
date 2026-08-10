import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PrismaService } from '../common/prisma/prisma.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Лёгкая проверка: процесс жив. Используется докер-хелсчеком. */
  @Get()
  ping() {
    return { status: 'ok', ts: new Date().toISOString() }
  }

  /** Глубокая проверка: БД действительно отвечает. Используется деплой-скриптом. */
  @Get('deep')
  async deep() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok', db: 'ok', ts: new Date().toISOString() }
  }
}
