import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@lumira/db'

/**
 * Обёртка над singleton-клиентом из @lumira/db с хуками жизненного цикла Nest.
 * TransactionManager кладёт транзакционный клиент в AsyncLocalStorage и подменяет
 * этот сервис изнутри контекста запроса (см. transaction-manager.service.ts).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Prisma connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
