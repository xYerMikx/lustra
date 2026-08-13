import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { MarkNoShowUseCase } from '@/modules/bookings/app/mark-no-show.usecase'
import { sampleBookingRecord } from '@/modules/bookings/domain/sample-booking-record'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

const unusedTx = {} as PrismaTx

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
    findService: vi.fn(),
    getPolicy: vi.fn(),
    findClientUser: vi.fn(),
    findBookingByIdempotencyKey: vi.fn(),
    findBookingById: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b1',
        masterId: 'm1',
        status: 'confirmed',
        startsAt: new Date('2026-08-12T10:00:00.000Z'),
        endsAt: new Date('2026-08-12T11:00:00.000Z'),
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
    markNoShow: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b1',
        masterId: 'm1',
        status: 'no_show',
        startsAt: new Date('2026-08-12T10:00:00.000Z'),
        endsAt: new Date('2026-08-12T11:00:00.000Z'),
      }),
    ),
    listMasterClients: vi.fn(),
    createManualBooking: vi.fn(),
    rescheduleBooking: vi.fn(),
    ...overrides,
  }
}

describe('MarkNoShowUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('marks a confirmed booking after the visit started', async () => {
    const store = buildStore()
    const useCase = new MarkNoShowUseCase(store, createTransactions(), clock)

    const result = await useCase.execute(currentUser, 'b1')

    expect(result.booking.status).toBe('no_show')
    expect(store.markNoShow).toHaveBeenCalledWith({
      bookingId: 'b1',
      masterId: 'm1',
      currentUserId: currentUser.id,
      fromStatus: 'confirmed',
      clientUserId: '33333333-3333-3333-3333-333333333333',
      now: clock.now(),
    })
  })

  it('rejects marking a future visit', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'm1',
          status: 'confirmed',
          startsAt: new Date('2026-08-20T10:00:00.000Z'),
        }),
      ),
    })
    const useCase = new MarkNoShowUseCase(store, createTransactions(), clock)

    await expect(useCase.execute(currentUser, 'b1')).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
    expect(store.markNoShow).not.toHaveBeenCalled()
  })

  it('hides another master booking as not found', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'other',
          status: 'confirmed',
        }),
      ),
    })
    const useCase = new MarkNoShowUseCase(store, createTransactions(), clock)

    await expect(useCase.execute(currentUser, 'b1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
  })
})
