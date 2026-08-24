import { Injectable } from '@nestjs/common'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'

export const TELEGRAM_CHAT_TAKEN = 'TELEGRAM_CHAT_TAKEN'

@Injectable()
export class TelegramAccountRepository {
  constructor(private readonly tx: TransactionManager) {}

  findByUserId(userId: string): Promise<{ chatId: bigint } | null> {
    return this.tx.getClient().telegramAccount.findUnique({
      where: { userId },
      select: { chatId: true },
    })
  }

  async upsertLink(input: {
    userId: string
    chatId: bigint
    username: string | null
  }): Promise<void> {
    const db = this.tx.getClient()

    await db.telegramAccount.deleteMany({
      where: { userId: input.userId },
    })

    try {
      await db.telegramAccount.create({
        data: {
          userId: input.userId,
          chatId: input.chatId,
          username: input.username,
          isBlocked: false,
        },
      })
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT
      ) {
        throw new Error(TELEGRAM_CHAT_TAKEN)
      }

      throw error
    }
  }

  async unlink(userId: string): Promise<void> {
    await this.tx.getClient().telegramAccount.deleteMany({
      where: { userId },
    })
  }
}
