import { Inject, Injectable } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'
import type {
  NotificationQueueJob,
  NotificationStore,
  TelegramSender,
} from '@/modules/notifications/app/notifications.ports'
import {
  NOTIFICATION_STORE,
  TELEGRAM_SENDER,
} from '@/modules/notifications/app/notifications.ports'
import {
  NotifyTemplate,
  notifyDedupeKey,
  notifyJobId,
  renderNotifyText,
} from '@/modules/notifications/domain/notify-template'

const REMINDER_TEMPLATES = new Set<NotifyTemplate>([
  NotifyTemplate.Reminder24hClient,
  NotifyTemplate.Reminder2hMaster,
])

@Injectable()
export class SendTelegramUseCase {
  constructor(
    @Inject(NOTIFICATION_STORE)
    private readonly store: NotificationStore,
    @Inject(TELEGRAM_SENDER)
    private readonly telegram: TelegramSender,
    private readonly clock: ClockService,
  ) {}

  async execute(job: NotificationQueueJob): Promise<void> {
    const booking = await this.store.findBookingSnapshot(job.bookingId)

    if (!booking) {
      return
    }

    if (REMINDER_TEMPLATES.has(job.template) && booking.status !== 'confirmed') {
      return
    }

    const recipient = await this.store.findRecipient(job.userId)

    if (!recipient) {
      return
    }

    const dedupeKey = notifyDedupeKey(job.template, job.bookingId)
    const jobId = notifyJobId(job.template, job.bookingId, job.userId)
    const inserted = await this.store.tryInsertLog({
      userId: job.userId,
      template: job.template,
      bookingId: job.bookingId,
      dedupeKey,
      jobId,
    })

    if (inserted === 'duplicate') {
      return
    }

    if (!recipient.telegramEnabled || recipient.isBlocked || !recipient.chatId) {
      await this.store.markLogSkipped(
        dedupeKey,
        skipReason(recipient.telegramEnabled, recipient.isBlocked, recipient.chatId),
      )

      return
    }

    const text = renderNotifyText(job.template, {
      serviceTitle: booking.serviceTitle,
      masterDisplayName: booking.masterDisplayName,
      clientName: booking.clientName,
      startsAt: booking.startsAt,
      cancelReason: booking.cancelReason,
    })

    const outcome = await this.telegram.send(recipient.chatId, text)
    const now = this.clock.now()

    if (outcome.kind === 'sent') {
      await this.store.markLogSent(dedupeKey, now)

      return
    }

    if (outcome.kind === 'blocked') {
      await this.store.markTelegramBlocked(job.userId)
      await this.store.markLogSkipped(dedupeKey, 'telegram 403 blocked')

      return
    }

    if (outcome.kind === 'skipped') {
      await this.store.markLogSkipped(dedupeKey, outcome.reason)

      return
    }

    await this.store.markLogFailed(dedupeKey, outcome.error)
    throw new Error(outcome.error)
  }
}

function skipReason(
  telegramEnabled: boolean,
  isBlocked: boolean,
  chatId: string | null,
): string {
  if (!telegramEnabled) {
    return 'telegram disabled'
  }

  if (isBlocked) {
    return 'telegram blocked'
  }

  if (!chatId) {
    return 'telegram not linked'
  }

  return 'skipped'
}
