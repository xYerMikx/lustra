import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { ConfirmBookingUseCase } from '@/modules/bookings/app/confirm-booking.usecase'
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
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
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
    confirmHold: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'c1',
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        status: 'confirmed',
        holdExpiresAt: null,
        clientComment: 'ок',
        confirmedAt: new Date('2026-08-12T12:00:00.000Z'),
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
      }),
    ),
    cancelBooking: vi.fn(),
    confirmPending: vi.fn(),
    listMasterClients: vi.fn(),
    createManualBooking: vi.fn(),
    ...overrides,
  }
}

describe('ConfirmBookingUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('confirms own hold and strips private fields', async () => {
    const store = buildStore()
    const useCase = new ConfirmBookingUseCase(
      store,
      createTransactions(),
      clock,
    )

    const result = await useCase.execute(currentUser, 'b1', { comment: 'ок' })

    expect(result.booking.status).toBe('confirmed')
    expect(result.booking).not.toHaveProperty('masterNote')
    expect(store.confirmHold).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'b1',
        toStatus: 'confirmed',
        clientComment: 'ок',
      }),
    )
  })

  it('hides foreign bookings as not found', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'm1',
          clientUserId: 'other',
          status: 'hold',
          holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        }),
      ),
    })
    const useCase = new ConfirmBookingUseCase(
      store,
      createTransactions(),
      clock,
    )

    await expect(useCase.execute(currentUser, 'b1', {})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('rejects expired holds', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue(
        sampleBookingRecord({
          id: 'b1',
          masterId: 'm1',
          clientUserId: 'c1',
          status: 'hold',
          holdExpiresAt: new Date('2026-08-12T11:59:00.000Z'),
        }),
      ),
    })
    const useCase = new ConfirmBookingUseCase(
      store,
      createTransactions(),
      clock,
    )

    await expect(useCase.execute(currentUser, 'b1', {})).rejects.toMatchObject({
      code: 'HOLD_EXPIRED',
    })
  })
})
