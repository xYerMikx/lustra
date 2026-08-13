import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { RescheduleBookingUseCase } from '@/modules/bookings/app/reschedule-booking.usecase'
import { sampleBookingRecord } from '@/modules/bookings/domain/sample-booking-record'
import type { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

const unusedTx = {} as PrismaTx
const nextStartsAt = '2026-08-21T10:00:00.000Z'

function createTransactions(): TransactionManager {
  const transactions: Pick<TransactionManager, 'run' | 'getClient'> = {
    run: async <T>(work: (tx: PrismaTx) => Promise<T>) => work(unusedTx),
    getClient: () => unusedTx,
  }

  return transactions as unknown as TransactionManager
}

function buildStore(overrides: Partial<BookingStore> = {}): BookingStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    findMasterPubliclyVisible: vi.fn(),
    findService: vi.fn().mockResolvedValue({
      id: 'svc1',
      masterId: 'm1',
      title: 'Маникюр',
      durationMin: 90,
      bufferAfterMin: 0,
      price: '50.00',
      currency: 'BYN',
      isActive: true,
    }),
    getPolicy: vi.fn().mockResolvedValue({
      granularityMin: 30,
      minLeadTimeMin: 60,
      maxHorizonDays: 30,
      bufferAfterMin: 0,
      holdTtlSec: 600,
      autoConfirm: false,
      maxActiveBookingsPerClient: 3,
      clientCancelCutoffMin: 720,
    }),
    findClientUser: vi.fn(),
    findBookingByIdempotencyKey: vi.fn(),
    findBookingById: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b1',
        masterId: 'm1',
        serviceId: 'svc1',
        status: 'confirmed',
        holdExpiresAt: null,
        confirmedAt: new Date('2026-08-12T12:00:00.000Z'),
      }),
    ),
    listBookingsForClient: vi.fn(),
    listBookingsForMaster: vi.fn(),
    countActiveBookingsForClient: vi.fn(),
    upsertMasterClient: vi.fn(),
    listGranulesInRange: vi.fn(),
    createHold: vi.fn(),
    confirmHold: vi.fn(),
    cancelBooking: vi.fn(),
    confirmPending: vi.fn(),
    completeBooking: vi.fn(),
    listMasterClients: vi.fn(),
    createManualBooking: vi.fn(),
    rescheduleBooking: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b2',
        masterId: 'm1',
        serviceId: 'svc1',
        status: 'confirmed',
        holdExpiresAt: null,
        confirmedAt: new Date('2026-08-13T12:00:00.000Z'),
        startsAt: new Date(nextStartsAt),
        endsAt: new Date('2026-08-21T11:30:00.000Z'),
      }),
    ),
    ...overrides,
  }
}

describe('RescheduleBookingUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-13T12:00:00.000Z'))

  it('moves a confirmed booking to a new time and returns the new row', async () => {
    const store = buildStore()
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase
    const useCase = new RescheduleBookingUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    const result = await useCase.execute(currentUser, 'b1', {
      startsAt: nextStartsAt,
      reason: 'клиент попросил позже',
    })

    expect(result.booking.id).toBe('b2')
    expect(result.booking.startsAt).toBe(nextStartsAt)
    expect(store.rescheduleBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'b1',
        masterId: 'm1',
        currentUserId: currentUser.id,
        reason: 'клиент попросил позже',
        startsAt: new Date(nextStartsAt),
      }),
    )
    expect(ensureSlots.execute).toHaveBeenCalled()
  })

  it('rejects the same start time', async () => {
    const store = buildStore()
    const useCase = new RescheduleBookingUseCase(
      store,
      createTransactions(),
      clock,
      { execute: vi.fn() } as unknown as EnsureSlotsUseCase,
    )

    await expect(
      useCase.execute(currentUser, 'b1', {
        startsAt: '2026-08-20T10:00:00.000Z',
        reason: 'ошибка',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
      message: 'Это то же время',
    } satisfies Partial<DomainError>)
    expect(store.rescheduleBooking).not.toHaveBeenCalled()
  })

  it('hides another master’s booking', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'other',
          status: 'confirmed',
        }),
      ),
    })
    const useCase = new RescheduleBookingUseCase(
      store,
      createTransactions(),
      clock,
      { execute: vi.fn() } as unknown as EnsureSlotsUseCase,
    )

    await expect(
      useCase.execute(currentUser, 'b1', {
        startsAt: nextStartsAt,
        reason: 'перенос',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' } satisfies Partial<DomainError>)
  })

  it('rejects a completed booking', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'm1',
          status: 'completed',
        }),
      ),
    })
    const useCase = new RescheduleBookingUseCase(
      store,
      createTransactions(),
      clock,
      { execute: vi.fn() } as unknown as EnsureSlotsUseCase,
    )

    await expect(
      useCase.execute(currentUser, 'b1', {
        startsAt: nextStartsAt,
        reason: 'перенос',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE' } satisfies Partial<DomainError>)
  })
})
