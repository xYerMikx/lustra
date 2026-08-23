import { describe, expect, it, vi } from 'vitest'

import { FixedClock } from '@/common/time/clock.service'
import { HandleOutboxEventUseCase } from '@/modules/notifications/app/handle-outbox-event.usecase'
import { ScheduleRemindersUseCase } from '@/modules/notifications/app/schedule-reminders.usecase'
import { CancelRemindersUseCase } from '@/modules/notifications/app/cancel-reminders.usecase'
import { EnqueueCancelNoticesUseCase } from '@/modules/notifications/app/enqueue-cancel-notices.usecase'
import type {
  NotificationQueue,
  NotificationStore,
  NotifyBookingSnapshot,
} from '@/modules/notifications/app/notifications.ports'
import { NotifyTemplate } from '@/modules/notifications/domain/notify-template'
import { MASTER_TIMEZONE, zonedLocalToUtc } from '@/modules/scheduling/domain/tz'

const startsAt = zonedLocalToUtc('2026-08-22', 15 * 60, MASTER_TIMEZONE)
const bookedAt = zonedLocalToUtc('2026-08-20', 12 * 60, MASTER_TIMEZONE)
const now = zonedLocalToUtc('2026-08-20', 12 * 60, MASTER_TIMEZONE)

const booking: NotifyBookingSnapshot = {
  id: 'b1',
  status: 'confirmed',
  startsAt,
  bookedAt,
  serviceTitle: 'Маникюр',
  masterDisplayName: 'Анна',
  clientName: 'Катя',
  clientUserId: 'c1',
  masterUserId: 'm1',
  cancelReason: null,
}

const recipient = {
  userId: 'x',
  chatId: '1',
  isBlocked: false,
  telegramEnabled: true,
  reminder24hEnabled: true,
  reminder2hEnabled: true,
  quietHoursEnabled: true,
}

function buildStore(
  snapshot: NotifyBookingSnapshot | null = booking,
): NotificationStore {
  return {
    claimPending: vi.fn(),
    markDone: vi.fn(),
    markRetry: vi.fn(),
    findBookingSnapshot: vi.fn().mockResolvedValue(snapshot),
    findRecipient: vi.fn().mockImplementation(async (userId: string) => ({
      ...recipient,
      userId,
    })),
    tryInsertLog: vi.fn(),
    markLogSent: vi.fn(),
    markLogSkipped: vi.fn(),
    markLogFailed: vi.fn(),
    markTelegramBlocked: vi.fn(),
  }
}

describe('ScheduleRemindersUseCase', () => {
  it('enqueues client 24h and master 2h jobs', async () => {
    const queue: NotificationQueue = {
      addTelegramSend: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
    }
    const useCase = new ScheduleRemindersUseCase(
      buildStore(),
      queue,
      new FixedClock(now),
    )

    await useCase.execute('b1')

    expect(queue.addTelegramSend).toHaveBeenCalledTimes(2)
    expect(queue.addTelegramSend).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          template: NotifyTemplate.Reminder24hClient,
          userId: 'c1',
        }),
      }),
    )
    expect(queue.addTelegramSend).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          template: NotifyTemplate.Reminder2hMaster,
          userId: 'm1',
        }),
      }),
    )
  })

  it('does not enqueue reminders for pending bookings', async () => {
    const queue: NotificationQueue = {
      addTelegramSend: vi.fn(),
      remove: vi.fn(),
    }
    const useCase = new ScheduleRemindersUseCase(
      buildStore({ ...booking, status: 'pending' }),
      queue,
      new FixedClock(now),
    )

    await useCase.execute('b1')

    expect(queue.addTelegramSend).not.toHaveBeenCalled()
  })
})

describe('HandleOutboxEventUseCase', () => {
  it('cancels reminder jobs when a booking is cancelled', async () => {
    const queue: NotificationQueue = {
      addTelegramSend: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    }
    const store = buildStore({
      ...booking,
      status: 'cancelled_by_client',
    })
    const handle = new HandleOutboxEventUseCase(
      new ScheduleRemindersUseCase(store, queue, new FixedClock(now)),
      new CancelRemindersUseCase(store, queue),
      new EnqueueCancelNoticesUseCase(store, queue),
    )

    await handle.execute({
      type: 'booking.cancelled',
      payload: { bookingId: 'b1' },
    })

    expect(queue.remove).toHaveBeenCalled()
    expect(queue.addTelegramSend).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          template: NotifyTemplate.BookingCancelledMaster,
        }),
      }),
    )
  })
})
