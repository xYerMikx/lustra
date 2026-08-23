import { Injectable, Logger } from '@nestjs/common'

import type {
  TelegramSendOutcome,
  TelegramSendOptions,
  TelegramSender,
} from '@/modules/notifications/app/notifications.ports'

@Injectable()
export class TelegramBotSender implements TelegramSender {
  private readonly logger = new Logger(TelegramBotSender.name)

  async send(
    chatId: string,
    text: string,
    options?: TelegramSendOptions,
  ): Promise<TelegramSendOutcome> {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim()

    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is empty; skip send')

      return { kind: 'skipped', reason: 'TELEGRAM_BOT_TOKEN empty' }
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
          ...(options?.buttons?.length
            ? {
                reply_markup: {
                  inline_keyboard: [
                    options.buttons.map((button) => ({
                      text: button.text,
                      url: button.url,
                    })),
                  ],
                },
              }
            : {}),
        }),
      })

      const body = (await response.json()) as {
        ok?: boolean
        error_code?: number
        description?: string
      }

      if (response.status === 403 || body.error_code === 403) {
        return { kind: 'blocked' }
      }

      if (!response.ok || body.ok === false) {
        const error = body.description ?? `telegram HTTP ${response.status}`
        this.logger.error(error, 'telegram sendMessage failed')

        return {
          kind: 'failed',
          error,
        }
      }

      return { kind: 'sent' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'telegram fetch failed'
      this.logger.error(message, 'telegram sendMessage failed')

      return { kind: 'failed', error: message }
    }
  }
}
