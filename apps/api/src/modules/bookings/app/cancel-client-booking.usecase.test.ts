import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { CancelClientBookingUseCase } from '@/modules/bookings/app/cancel-client-booking.usecase'
import { sampleBookingRecord } from '@/modules/bookings/domain/sample-booking-record'

const currentUser: AuthUser = {
  id: 'c1',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

const unusedTx = {} as PrismaTx

function createTransactions(): TransactionManager {
  const transactions: Pick<TransactionManager, 'run' | 'getClient'> = {
    run: async <T>(work: (tx: PrismaTx) => Promise<T>) => work(unusedTx),
    getClient: () => unusedTx,
  }

  return transactions as TransactionManager
}

function buildStore(overrides: Partial<BookingStore> = {}): BookingStore {
  return {
    findMasterIdByUserId: vi.fn(),
    findMasterPubliclyVisible: vi.fn(),
    findService: vi.fn(),
    getPolicy: vi.fn().mockResolvedValue({
      granularityMin: 30,
      minLeadTimeMin: 60,
      maxHorizonDays: 30,
      bufferAfterMin: 0,
      holdTtlSec: 600,
      autoConfirm: true,
      maxActiveBookingsPerClient: 3,
      clientCancelCutoffMin: 720,
    }),
    findClientUser: vi.fn(),
    findBookingByIdempotencyKey: vi.fn(),
    findBookingById: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'c1',
        status: 'confirmed',
        holdExpiresAt: null,
        confirmedAt: new Date('2026-08-12T11:00:00.000Z'),
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
      }),
    ),
    listBookingsForClient: vi.fn(),
    listBookingsForMaster: vi.fn(),
    countActiveBookingsForClient: vi.fn(),
    upsertMasterClient: vi.fn(),
    listGranulesInRange: vi.fn(),
    createHold: vi.fn(),
    confirmHold: vi.fn(),
    cancelBooking: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'c1',
        status: 'cancelled_by_client',
        holdExpiresAt: null,
        confirmedAt: new Date('2026-08-12T11:00:00.000Z'),
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
        addressExact: null,
      }),
    ),
    confirmPending: vi.fn(),
    ...overrides,
  }
}

describe('CancelClientBookingUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('cancels own booking before cutoff', async () => {
    const store = buildStore()
    const useCase = new CancelClientBookingUseCase(
      store,
      createTransactions(),
      clock,
    )

    const result = await useCase.execute(currentUser, 'b1', { reason: 'перенос' })

    expect(result.booking.status).toBe('cancelled_by_client')
    expect(store.cancelBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'b1',
        toStatus: 'cancelled_by_client',
        cancelledByType: 'client',
        reason: 'перенос',
      }),
    )
  })

  it('returns CANCEL_CUTOFF_PASSED after cutoff', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'm1',
          clientUserId: 'c1',
          status: 'confirmed',
          holdExpiresAt: null,
          startsAt: new Date('2026-08-12T18:00:00.000Z'),
          endsAt: new Date('2026-08-12T19:00:00.000Z'),
        }),
      ),
    })
    const useCase = new CancelClientBookingUseCase(
      store,
      createTransactions(),
      clock,
    )

    await expect(useCase.execute(currentUser, 'b1', {})).rejects.toMatchObject({
      code: 'CANCEL_CUTOFF_PASSED',
    })
  })

  it('hides foreign bookings', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          clientUserId: 'other',
          status: 'confirmed',
          holdExpiresAt: null,
        }),
      ),
    })
    const useCase = new CancelClientBookingUseCase(
      store,
      createTransactions(),
      clock,
    )

    await expect(useCase.execute(currentUser, 'b1', {})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })
})
