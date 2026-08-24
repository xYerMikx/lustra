import { Inject, Injectable } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'
import type {
  NotificationQueue,
  NotificationStore,
} from '@/modules/notifications/app/notifications.ports'
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
} from '@/modules/notifications/app/notifications.ports'
import {
  NotifyTemplate,
  notifyJobId,
} from '@/modules/notifications/domain/notify-template'
import {
  clientReminderFireAt,
  masterReminderFireAt,
} from '@/modules/notifications/domain/reminder-fire-at'

@Injectable()
export class ScheduleRemindersUseCase {
  constructor(
    @Inject(NOTIFICATION_STORE)
    private readonly store: NotificationStore,
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue: NotificationQueue,
    private readonly clock: ClockService,
  ) {}

  async execute(bookingId: string): Promise<void> {
    const booking = await this.store.findBookingSnapshot(bookingId)

    if (!booking || booking.status !== 'confirmed') {
      return
    }

    const now = this.clock.now()
    const clientUserId = booking.clientUserId

    if (clientUserId) {
      await this.enqueueClient(
        {
          id: booking.id,
          startsAt: booking.startsAt,
          bookedAt: booking.bookedAt,
          clientUserId,
        },
        now,
      )
    }

    await this.enqueueMaster(booking, now)
  }

  private async enqueueClient(
    booking: {
      id: string
      startsAt: Date
      bookedAt: Date
      clientUserId: string
    },
    now: Date,
  ): Promise<void> {
    const recipient = await this.store.findRecipient(booking.clientUserId)

    if (!recipient || !recipient.reminder24hEnabled) {
      return
    }

    const fireAt = clientReminderFireAt({
      startsAt: booking.startsAt,
      bookedAt: booking.bookedAt,
      now,
      applyQuietHours: recipient.quietHoursEnabled,
    })

    if (!fireAt) {
      return
    }

    const template = NotifyTemplate.Reminder24hClient

    await this.queue.addTelegramSend({
      jobId: notifyJobId(template, booking.id, booking.clientUserId),
      delayMs: Math.max(0, fireAt.getTime() - now.getTime()),
      payload: {
        template,
        bookingId: booking.id,
        userId: booking.clientUserId,
      },
    })
  }

  private async enqueueMaster(
    booking: {
      id: string
      startsAt: Date
      masterUserId: string
    },
    now: Date,
  ): Promise<void> {
    const recipient = await this.store.findRecipient(booking.masterUserId)

    if (!recipient || !recipient.reminder2hEnabled) {
      return
    }

    const fireAt = masterReminderFireAt({
      startsAt: booking.startsAt,
      now,
      applyQuietHours: recipient.quietHoursEnabled,
    })

    if (!fireAt) {
      return
    }

    const template = NotifyTemplate.Reminder2hMaster

    await this.queue.addTelegramSend({
      jobId: notifyJobId(template, booking.id, booking.masterUserId),
      delayMs: Math.max(0, fireAt.getTime() - now.getTime()),
      payload: {
        template,
        bookingId: booking.id,
        userId: booking.masterUserId,
      },
    })
  }
}
