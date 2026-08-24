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
export class CancelRemindersUseCase {
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

    if (booking.clientUserId) {
      await this.queue.remove(
        notifyJobId(
          NotifyTemplate.Reminder24hClient,
          booking.id,
          booking.clientUserId,
        ),
      )
    }

    await this.queue.remove(
      notifyJobId(
        NotifyTemplate.Reminder2hMaster,
        booking.id,
        booking.masterUserId,
      ),
    )
  }
}
