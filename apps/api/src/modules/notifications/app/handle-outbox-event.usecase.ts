import { Injectable } from '@nestjs/common'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import { CancelRemindersUseCase } from '@/modules/notifications/app/cancel-reminders.usecase'
import { EnqueueCancelNoticesUseCase } from '@/modules/notifications/app/enqueue-cancel-notices.usecase'
import { ScheduleRemindersUseCase } from '@/modules/notifications/app/schedule-reminders.usecase'
import {
  readOutboxBookingId,
  shouldScheduleReminders,
} from '@/modules/notifications/domain/outbox-payload'

@Injectable()
export class HandleOutboxEventUseCase {
  constructor(
    private readonly scheduleReminders: ScheduleRemindersUseCase,
    private readonly cancelReminders: CancelRemindersUseCase,
    private readonly enqueueCancelNotices: EnqueueCancelNoticesUseCase,
  ) {}

  async execute(event: { type: string; payload: unknown }): Promise<void> {
    const bookingId = readOutboxBookingId(event.payload)

    if (!bookingId) {
      return
    }

    if (shouldScheduleReminders(event.type)) {
      await this.scheduleReminders.execute(bookingId)

      return
    }

    if (event.type === OutboxEventType.BookingCancelled) {
      await this.cancelReminders.execute(bookingId)
      await this.enqueueCancelNotices.execute(bookingId)
    }
  }
}
