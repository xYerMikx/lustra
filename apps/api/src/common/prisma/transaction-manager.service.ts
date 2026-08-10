import { AsyncLocalStorage } from 'node:async_hooks'

import { Injectable } from '@nestjs/common'
import type { Prisma } from '@lustra/db'

import { PrismaService } from './prisma.service'

export type PrismaTx = Prisma.TransactionClient

const storage = new AsyncLocalStorage<PrismaTx>()

/**
 * Единая точка открытия транзакций (см. TECH-DESIGN §14).
 * Правила:
 *  - транзакция короткая: без HTTP-вызовов, Telegram, загрузки файлов внутри
 *  - lock_timeout выставляется на уровне пула соединений/сессии (см. connection string)
 *  - use-case вызывает `run(...)`, репозитории берут клиент через `getClient()`
 *    и не получают `tx` явным параметром через 5 слоёв вызовов.
 */
@Injectable()
export class TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(fn: (tx: PrismaTx) => Promise<T>): Promise<T> {
    const existing = storage.getStore()
    if (existing) {
      // Вложенный run() внутри уже открытой транзакции — используем тот же клиент,
      // не открываем savepoint (в MVP это не требуется).
      return fn(existing)
    }
    return this.prisma.$transaction(
      (tx) => storage.run(tx, () => fn(tx)),
      { maxWait: 3_000, timeout: 5_000 },
    )
  }

  /** Клиент для репозиториев: транзакционный, если мы внутри run(), иначе обычный. */
  getClient(): PrismaTx | PrismaService {
    return storage.getStore() ?? this.prisma
  }
}
