import { Inject, Injectable, Logger } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { hashToken } from '@/modules/auth/domain/token-hash'
import {
  AUTH_TOKEN_ALREADY_USED,
  AuthTokenRepository,
} from '@/modules/auth/infra/auth-token.repository'
import type { TelegramSender } from '@/modules/notifications/app/notifications.ports'
import { TELEGRAM_SENDER } from '@/modules/notifications/app/notifications.ports'
import { parseTelegramStartNonce } from '@/modules/notifications/domain/telegram-link'
import {
  TELEGRAM_CHAT_TAKEN,
  TelegramAccountRepository,
} from '@/modules/telegram/infra/telegram-account.repository'

type TelegramUpdate = {
  message?: {
    text?: string
    chat?: { id?: number }
    from?: { username?: string }
  }
}

const INVALID_LINK = 'Ссылка недействительна или устарела.'

@Injectable()
export class HandleTelegramUpdateUseCase {
  private readonly logger = new Logger(HandleTelegramUpdateUseCase.name)

  constructor(
    private readonly tokens: AuthTokenRepository,
    private readonly accounts: TelegramAccountRepository,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
    @Inject(TELEGRAM_SENDER)
    private readonly telegram: TelegramSender,
  ) {}

  async execute(update: TelegramUpdate): Promise<void> {
    const chatId = update.message?.chat?.id
    const nonce = parseTelegramStartNonce(update.message?.text)

    if (!nonce || typeof chatId !== 'number') {
      return
    }

    const chatIdText = String(chatId)
    const now = this.clock.now()
    const token = await this.tokens.findByHash('telegram_link', hashToken(nonce))
    const userId = token?.userId ?? null

    if (!token || !userId) {
      await this.telegram.send(chatIdText, INVALID_LINK)

      return
    }

    if (token.usedAt || token.expiresAt.getTime() <= now.getTime()) {
      await this.telegram.send(chatIdText, INVALID_LINK)

      return
    }

    const username = update.message?.from?.username ?? null

    try {
      await this.tx.run(async () => {
        await this.tokens.markUsed(token.id, now)
        await this.accounts.upsertLink({
          userId,
          chatId: BigInt(chatId),
          username,
        })
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === AUTH_TOKEN_ALREADY_USED) {
        await this.telegram.send(chatIdText, 'Ссылка уже использована.')

        return
      }

      if (error instanceof Error && error.message === TELEGRAM_CHAT_TAKEN) {
        await this.telegram.send(
          chatIdText,
          'Этот Telegram уже привязан к другому аккаунту.',
        )

        return
      }

      this.logger.error(error, 'telegram link failed')
      await this.telegram.send(
        chatIdText,
        'Не удалось привязать Telegram. Попробуйте ещё раз.',
      )

      return
    }

    await this.telegram.send(
      chatIdText,
      'Telegram подключён. Вы будете получать напоминания о записях.',
    )
  }
}
