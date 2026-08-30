import { Injectable } from '@nestjs/common'
import type { TelegramLinkStartResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import { hashToken } from '@/modules/auth/domain/token-hash'
import { AuthTokenRepository } from '@/modules/auth/infra/auth-token.repository'
import {
  TELEGRAM_LINK_TTL_SEC,
  generateTelegramLinkNonce,
  telegramDeepLink,
} from '@/modules/notifications/domain/telegram-link'

@Injectable()
export class StartTelegramLinkUseCase {
  constructor(
    private readonly tokens: AuthTokenRepository,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(currentUser: AuthUser): Promise<TelegramLinkStartResponse> {
    const nonce = generateTelegramLinkNonce()
    const now = this.clock.now()
    const expiresAt = new Date(now.getTime() + TELEGRAM_LINK_TTL_SEC * 1000)

    await this.tx.run(async () => {
      await this.tokens.invalidateUnused(currentUser.id, 'telegram_link', now)
      await this.tokens.create({
        userId: currentUser.id,
        kind: 'telegram_link',
        tokenHash: hashToken(nonce),
        expiresAt,
      })
    })

    const username = process.env.TELEGRAM_BOT_USERNAME?.trim() ?? ''

    return { deepLink: telegramDeepLink(username, nonce) }
  }
}
