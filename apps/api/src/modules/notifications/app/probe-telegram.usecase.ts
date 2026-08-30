import { Inject, Injectable } from '@nestjs/common'
import type { OkResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  NotificationStore,
  NotifyBookingSnapshot,
  TelegramSender,
} from '@/modules/notifications/app/notifications.ports'
import {
  NOTIFICATION_STORE,
  TELEGRAM_SENDER,
} from '@/modules/notifications/app/notifications.ports'
import {
  NotifyTemplate,
  renderNotifyText,
} from '@/modules/notifications/domain/notify-template'

@Injectable()
export class ProbeTelegramUseCase {
  constructor(
    @Inject(NOTIFICATION_STORE)
    private readonly store: NotificationStore,
    @Inject(TELEGRAM_SENDER)
    private readonly telegram: TelegramSender,
  ) {}

  async execute(currentUser: AuthUser, bookingId: string): Promise<OkResponse> {
    if (process.env.NODE_ENV === 'production') {
      throw DomainError.notFound()
    }

    const booking = await this.store.findBookingSnapshot(bookingId)

    if (!booking || !ownsBooking(currentUser, booking)) {
      throw DomainError.notFound('Запись не найдена')
    }

    const recipient = await this.store.findRecipient(currentUser.id)

    if (
      !recipient ||
      !recipient.telegramEnabled ||
      recipient.isBlocked ||
      !recipient.chatId
    ) {
      throw DomainError.invalidState(
        'Telegram не подключён. Сначала привяжите бота.',
      )
    }

    const template = templateFor(currentUser.role)
    const text = `[тест] ${renderNotifyText(template, {
      serviceTitle: booking.serviceTitle,
      masterDisplayName: booking.masterDisplayName,
      clientName: booking.clientName,
      startsAt: booking.startsAt,
      cancelReason: booking.cancelReason,
    })}`

    const outcome = await this.telegram.send(recipient.chatId, text)

    if (outcome.kind === 'sent') {
      return { ok: true }
    }

    if (outcome.kind === 'blocked') {
      throw DomainError.invalidState('Бот заблокирован в Telegram')
    }

    if (outcome.kind === 'skipped') {
      throw DomainError.invalidState(outcome.reason)
    }

    throw DomainError.invalidState(outcome.error)
  }
}

function ownsBooking(
  currentUser: AuthUser,
  booking: NotifyBookingSnapshot,
): boolean {
  if (currentUser.role === 'master') {
    return booking.masterUserId === currentUser.id
  }

  if (currentUser.role === 'client') {
    return booking.clientUserId === currentUser.id
  }

  return false
}

function templateFor(role: AuthUser['role']): NotifyTemplate {
  if (role === 'master') {
    return NotifyTemplate.Reminder2hMaster
  }

  return NotifyTemplate.Reminder24hClient
}
