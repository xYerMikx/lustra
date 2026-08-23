import { Inject, Injectable, Logger } from '@nestjs/common'

import { publicAppUrl } from '@/common/env/public-app-url'
import { ClockService } from '@/common/time/clock.service'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { hashToken } from '@/modules/auth/domain/token-hash'
import {
  AUTH_TOKEN_ALREADY_USED,
  AuthTokenRepository,
} from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import type { TelegramSender } from '@/modules/notifications/app/notifications.ports'
import { TELEGRAM_SENDER } from '@/modules/notifications/app/notifications.ports'
import {
  isTelegramHttpsButtonUrl,
  parseTelegramStartCommand,
  telegramOpenAppUrl,
  telegramReturnAppUrl,
} from '@/modules/notifications/domain/telegram-link'
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

const INVALID_LINK = 'Ссылка недействительна или устарела. Откройте Lumira и нажмите «Подключить» ещё раз.'
const BARE_START =
  'Чтобы получать напоминания о записях, откройте Lumira и нажмите «Подключить» в профиле.'
const LINKED =
  'Telegram подключён. Можно вернуться в Lumira — статус обновится сам.'

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
    private readonly users: AuthUserRepository,
  ) {}

  async execute(update: TelegramUpdate): Promise<void> {
    const chatId = update.message?.chat?.id
    const start = parseTelegramStartCommand(update.message?.text)

    if (!start || typeof chatId !== 'number') {
      return
    }

    const chatIdText = String(chatId)
    const openUrl = telegramOpenAppUrl(publicAppUrl())

    if (start.kind === 'bare') {
      await this.reply(chatIdText, BARE_START, {
        text: 'Открыть Lumira',
        url: openUrl,
      })

      return
    }

    await this.linkFromNonce(chatId, chatIdText, start.value, update.message?.from?.username ?? null, openUrl)
  }

  private async linkFromNonce(
    chatId: number,
    chatIdText: string,
    nonce: string,
    username: string | null,
    openUrl: string,
  ): Promise<void> {
    const now = this.clock.now()
    const token = await this.tokens.findByHash('telegram_link', hashToken(nonce))
    const userId = token?.userId ?? null

    if (!token || !userId) {
      await this.reply(chatIdText, INVALID_LINK, {
        text: 'Открыть Lumira',
        url: openUrl,
      })

      return
    }

    if (token.usedAt || token.expiresAt.getTime() <= now.getTime()) {
      await this.reply(chatIdText, INVALID_LINK, {
        text: 'Открыть Lumira',
        url: openUrl,
      })

      return
    }

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

    const user = await this.users.findById(userId)
    const returnUrl = user
      ? telegramReturnAppUrl(publicAppUrl(), user.role)
      : openUrl

    await this.reply(chatIdText, LINKED, {
      text: 'Вернуться в Lumira',
      url: returnUrl,
    })
  }

  private async reply(
    chatId: string,
    text: string,
    button: { text: string; url: string },
  ): Promise<void> {
    const canUseButton = isTelegramHttpsButtonUrl(button.url)
    const outcome = await this.telegram.send(
      chatId,
      canUseButton ? text : `${text}\n${button.url}`,
      canUseButton ? { buttons: [button] } : undefined,
    )

    if (outcome.kind === 'failed') {
      this.logger.error(outcome.error, 'telegram reply failed')
    }
  }
}
