import { describe, expect, it, vi } from 'vitest'

import { FixedClock } from '@/common/time/clock.service'
import { SendTelegramUseCase } from '@/modules/notifications/app/send-telegram.usecase'
import type {
  NotificationStore,
  NotifyBookingSnapshot,
  NotifyRecipient,
  TelegramSender,
} from '@/modules/notifications/app/notifications.ports'
import { NotifyTemplate } from '@/modules/notifications/domain/notify-template'

const booking: NotifyBookingSnapshot = {
  id: 'b1',
  status: 'confirmed',
  startsAt: new Date('2026-08-21T12:00:00.000Z'),
  bookedAt: new Date('2026-08-20T10:00:00.000Z'),
  serviceTitle: 'Маникюр',
  masterDisplayName: 'Анна',
  clientName: 'Катя',
  clientUserId: 'c1',
  masterUserId: 'm1',
  cancelReason: null,
}

const recipient: NotifyRecipient = {
  userId: 'c1',
  chatId: '100',
  isBlocked: false,
  telegramEnabled: true,
  reminder24hEnabled: true,
  reminder2hEnabled: true,
  quietHoursEnabled: true,
}

function buildStore(overrides: Partial<NotificationStore> = {}): NotificationStore {
  return {
    claimPending: vi.fn(),
    markDone: vi.fn(),
    markRetry: vi.fn(),
    findBookingSnapshot: vi.fn().mockResolvedValue(booking),
    findRecipient: vi.fn().mockResolvedValue(recipient),
    tryInsertLog: vi.fn().mockResolvedValue('inserted'),
    markLogSent: vi.fn(),
    markLogSkipped: vi.fn(),
    markLogFailed: vi.fn(),
    markTelegramBlocked: vi.fn(),
    ...overrides,
  }
}

describe('SendTelegramUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-20T12:00:00.000Z'))

  it('sends once and records the log', async () => {
    const store = buildStore()
    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'sent' }),
    }
    const useCase = new SendTelegramUseCase(store, telegram, clock)

    await useCase.execute({
      template: NotifyTemplate.Reminder24hClient,
      bookingId: 'b1',
      userId: 'c1',
    })

    expect(telegram.send).toHaveBeenCalledOnce()
    expect(store.markLogSent).toHaveBeenCalledOnce()
  })

  it('does not send when the dedupe key already exists', async () => {
    const store = buildStore({
      tryInsertLog: vi.fn().mockResolvedValue('duplicate'),
    })
    const telegram: TelegramSender = { send: vi.fn() }
    const useCase = new SendTelegramUseCase(store, telegram, clock)

    await useCase.execute({
      template: NotifyTemplate.Reminder24hClient,
      bookingId: 'b1',
      userId: 'c1',
    })

    expect(telegram.send).not.toHaveBeenCalled()
  })

  it('skips reminders for a cancelled booking', async () => {
    const store = buildStore({
      findBookingSnapshot: vi.fn().mockResolvedValue({
        ...booking,
        status: 'cancelled_by_client',
      }),
    })
    const telegram: TelegramSender = { send: vi.fn() }
    const useCase = new SendTelegramUseCase(store, telegram, clock)

    await useCase.execute({
      template: NotifyTemplate.Reminder24hClient,
      bookingId: 'b1',
      userId: 'c1',
    })

    expect(store.tryInsertLog).not.toHaveBeenCalled()
    expect(telegram.send).not.toHaveBeenCalled()
  })

  it('marks the account blocked on telegram 403', async () => {
    const store = buildStore()
    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'blocked' }),
    }
    const useCase = new SendTelegramUseCase(store, telegram, clock)

    await useCase.execute({
      template: NotifyTemplate.Reminder24hClient,
      bookingId: 'b1',
      userId: 'c1',
    })

    expect(store.markTelegramBlocked).toHaveBeenCalledWith('c1')
    expect(store.markLogSkipped).toHaveBeenCalled()
  })

  it('skips when telegram is not linked', async () => {
    const store = buildStore({
      findRecipient: vi.fn().mockResolvedValue({
        ...recipient,
        chatId: null,
      }),
    })
    const telegram: TelegramSender = { send: vi.fn() }
    const useCase = new SendTelegramUseCase(store, telegram, clock)

    await useCase.execute({
      template: NotifyTemplate.Reminder24hClient,
      bookingId: 'b1',
      userId: 'c1',
    })

    expect(telegram.send).not.toHaveBeenCalled()
    expect(store.markLogSkipped).toHaveBeenCalled()
  })
})
