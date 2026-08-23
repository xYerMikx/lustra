import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProbeTelegramUseCase } from '@/modules/notifications/app/probe-telegram.usecase'
import type {
  NotificationStore,
  NotifyBookingSnapshot,
  NotifyRecipient,
  TelegramSender,
} from '@/modules/notifications/app/notifications.ports'

const booking: NotifyBookingSnapshot = {
  id: 'b1',
  status: 'confirmed',
  startsAt: new Date('2026-08-24T07:00:00.000Z'),
  bookedAt: new Date('2026-08-23T18:00:00.000Z'),
  serviceTitle: 'Маникюр',
  masterDisplayName: 'Анна',
  clientName: 'Катя',
  clientUserId: 'c1',
  masterUserId: 'm1',
  cancelReason: null,
}

const recipient: NotifyRecipient = {
  userId: 'm1',
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

describe('ProbeTelegramUseCase', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('sends a prefixed master reminder without writing a log', async () => {
    const store = buildStore()
    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'sent' }),
    }
    const useCase = new ProbeTelegramUseCase(store, telegram)

    await expect(
      useCase.execute(
        { id: 'm1', role: 'master', email: 'master@example.com' },
        'b1',
      ),
    ).resolves.toEqual({ ok: true })

    expect(telegram.send).toHaveBeenCalledOnce()
    const text = vi.mocked(telegram.send).mock.calls[0]?.[1] ?? ''
    expect(text.startsWith('[тест] ')).toBe(true)
    expect(text).toContain('Через 2 часа')
    expect(store.tryInsertLog).not.toHaveBeenCalled()
  })

  it('sends a prefixed client reminder', async () => {
    const store = buildStore({
      findRecipient: vi.fn().mockResolvedValue({ ...recipient, userId: 'c1' }),
    })
    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'sent' }),
    }
    const useCase = new ProbeTelegramUseCase(store, telegram)

    await useCase.execute(
      { id: 'c1', role: 'client', email: 'client@example.com' },
      'b1',
    )

    const text = vi.mocked(telegram.send).mock.calls[0]?.[1] ?? ''
    expect(text).toContain('Напоминание о записи')
  })

  it('hides the endpoint in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const store = buildStore()
    const telegram: TelegramSender = { send: vi.fn() }
    const useCase = new ProbeTelegramUseCase(store, telegram)

    await expect(
      useCase.execute(
        { id: 'm1', role: 'master', email: 'master@example.com' },
        'b1',
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })

    expect(telegram.send).not.toHaveBeenCalled()
  })

  it('rejects when telegram is not linked', async () => {
    const store = buildStore({
      findRecipient: vi.fn().mockResolvedValue({ ...recipient, chatId: null }),
    })
    const telegram: TelegramSender = { send: vi.fn() }
    const useCase = new ProbeTelegramUseCase(store, telegram)

    await expect(
      useCase.execute(
        { id: 'm1', role: 'master', email: 'master@example.com' },
        'b1',
      ),
    ).rejects.toMatchObject({ code: 'INVALID_STATE' })
  })

  it('does not send for another master', async () => {
    const store = buildStore()
    const telegram: TelegramSender = { send: vi.fn() }
    const useCase = new ProbeTelegramUseCase(store, telegram)

    await expect(
      useCase.execute(
        { id: 'other', role: 'master', email: 'other@example.com' },
        'b1',
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })

    expect(telegram.send).not.toHaveBeenCalled()
  })
})
