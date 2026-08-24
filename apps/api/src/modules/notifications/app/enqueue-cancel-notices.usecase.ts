import { Inject, Injectable } from '@nestjs/common'

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

@Injectable()
export class EnqueueCancelNoticesUseCase {
  constructor(
    @Inject(NOTIFICATION_STORE)
    private readonly store: NotificationStore,
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue: NotificationQueue,
  ) {}

  async execute(bookingId: string): Promise<void> {
    const booking = await this.store.findBookingSnapshot(bookingId)

    if (!booking) {
      return
    }

    if (booking.status === 'cancelled_by_client') {
      await this.queue.addTelegramSend({
        jobId: notifyJobId(
          NotifyTemplate.BookingCancelledMaster,
          booking.id,
          booking.masterUserId,
        ),
        delayMs: 0,
        payload: {
          template: NotifyTemplate.BookingCancelledMaster,
          bookingId: booking.id,
          userId: booking.masterUserId,
        },
      })

      return
    }

    if (booking.status === 'cancelled_by_master' && booking.clientUserId) {
      await this.queue.addTelegramSend({
        jobId: notifyJobId(
          NotifyTemplate.BookingCancelledClient,
          booking.id,
          booking.clientUserId,
        ),
        delayMs: 0,
        payload: {
          template: NotifyTemplate.BookingCancelledClient,
          bookingId: booking.id,
          userId: booking.clientUserId,
        },
      })
    }
  }
}
