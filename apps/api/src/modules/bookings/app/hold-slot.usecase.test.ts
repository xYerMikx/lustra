import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { HoldSlotUseCase } from '@/modules/bookings/app/hold-slot.usecase'
import type { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

const currentUser: AuthUser = {
  id: 'c1',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

const startsAt = '2026-08-20T10:00:00.000Z'

const unusedTx = {} as PrismaTx

function createTransactions(): TransactionManager {
  const transactions: Pick<TransactionManager, 'run' | 'getClient'> = {
    run: async <T>(work: (tx: PrismaTx) => Promise<T>) => work(unusedTx),
    getClient: () => unusedTx,
  }

  return transactions as TransactionManager
}

function buildStore(overrides: Partial<BookingStore> = {}): BookingStore {
  const slotA = {
    id: 's1',
    startsAt: new Date(startsAt),
    endsAt: new Date('2026-08-20T10:30:00.000Z'),
    status: 'open' as const,
    holdExpiresAt: null,
  }
  const slotB = {
    id: 's2',
    startsAt: new Date('2026-08-20T10:30:00.000Z'),
    endsAt: new Date('2026-08-20T11:00:00.000Z'),
    status: 'open' as const,
    holdExpiresAt: null,
  }

  return {
    findMasterIdByUserId: vi.fn(),
    findMasterPubliclyVisible: vi.fn().mockResolvedValue(true),
    findService: vi.fn().mockResolvedValue({
      id: 'svc1',
      masterId: 'm1',
      title: 'Маникюр',
      durationMin: 60,
      bufferAfterMin: 0,
      price: '40.00',
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
    findClientUser: vi.fn().mockResolvedValue({
      id: 'c1',
      firstName: 'Анна',
      phone: null,
    }),
    findBookingByIdempotencyKey: vi.fn().mockResolvedValue(null),
    findBookingById: vi.fn(),
    listBookingsForClient: vi.fn(),
    listBookingsForMaster: vi.fn(),
    countActiveBookingsForClient: vi.fn().mockResolvedValue(0),
    upsertMasterClient: vi.fn().mockResolvedValue({ id: 'mc1', isBlocked: false }),
    listGranulesInRange: vi.fn().mockResolvedValue([slotA, slotB]),
    createHold: vi.fn().mockResolvedValue({
      id: 'b1',
      masterId: 'm1',
      clientUserId: 'c1',
      serviceId: 'svc1',
      serviceTitle: 'Маникюр',
      serviceDurationMin: 60,
      priceAmount: '40.00',
      currency: 'BYN',
      startsAt: new Date(startsAt),
      endsAt: new Date('2026-08-20T11:00:00.000Z'),
      status: 'hold',
      holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
      clientComment: null,
      confirmedAt: null,
      completedAt: null,
      review: null,
      receivedReview: null,
      clientReview: null,
      clientHasAccount: true,
      masterNote: null,
      masterDisplayName: 'Мастер',
      addressHint: null,
      addressExact: null,
      clientName: 'Анна',
      clientPhone: null,
      clientNote: null,
      clientSocialHandle: null,
    }),
    confirmHold: vi.fn(),
    cancelBooking: vi.fn(),
    confirmPending: vi.fn(),
    completeBooking: vi.fn(),
    markNoShow: vi.fn(),
    listMasterClients: vi.fn(),
    createManualBooking: vi.fn(),
    rescheduleBooking: vi.fn(),
    ...overrides,
  }
}

describe('HoldSlotUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('creates a hold for consecutive open granules', async () => {
    const store = buildStore()
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase
    const useCase = new HoldSlotUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    const result = await useCase.execute(
      currentUser,
      { masterId: 'm1', serviceId: 'svc1', startsAt },
      'smoke:1:hold-a',
    )

    expect(result.bookingId).toBe('b1')
    expect(store.createHold).toHaveBeenCalledOnce()
    expect(ensureSlots.execute).toHaveBeenCalled()
  })

  it('replays the same booking for Idempotency-Key', async () => {
    const store = buildStore({
      findBookingByIdempotencyKey: vi.fn().mockResolvedValue({
        id: 'b-existing',
        masterId: 'm1',
        clientUserId: 'c1',
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        currency: 'BYN',
        startsAt: new Date(startsAt),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        clientComment: null,
        confirmedAt: null,
        completedAt: null,
        review: null,
        receivedReview: null,
        clientReview: null,
        clientHasAccount: true,
        masterNote: 'secret',
        masterDisplayName: 'Мастер',
        addressHint: null,
        addressExact: null,
        clientName: 'Анна',
        clientPhone: null,
        clientNote: null,
      clientSocialHandle: null,
      }),
    })
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase
    const useCase = new HoldSlotUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    const result = await useCase.execute(
      currentUser,
      { masterId: 'm1', serviceId: 'svc1', startsAt },
      'smoke:1:hold-a',
    )

    expect(result.bookingId).toBe('b-existing')
    expect(result.summary).not.toHaveProperty('masterNote')
    expect(store.createHold).not.toHaveBeenCalled()
    expect(ensureSlots.execute).not.toHaveBeenCalled()
  })

  it('rejects hold when another client already holds the granules', async () => {
    const store = buildStore({
      listGranulesInRange: vi.fn().mockResolvedValue([
        {
          id: 's1',
          startsAt: new Date(startsAt),
          endsAt: new Date('2026-08-20T10:30:00.000Z'),
          status: 'held',
          holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        },
        {
          id: 's2',
          startsAt: new Date('2026-08-20T10:30:00.000Z'),
          endsAt: new Date('2026-08-20T11:00:00.000Z'),
          status: 'held',
          holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        },
      ]),
    })
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase
    const useCase = new HoldSlotUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    await expect(
      useCase.execute(
        currentUser,
        { masterId: 'm1', serviceId: 'svc1', startsAt },
        'smoke:1:hold-b',
      ),
    ).rejects.toMatchObject({ code: 'SLOT_TAKEN' })

    expect(store.createHold).not.toHaveBeenCalled()
  })

  it('simulates race: only the first of two competing holds wins', async () => {
    let listCalls = 0
    const store = buildStore({
      listGranulesInRange: vi.fn().mockImplementation(async () => {
        listCalls += 1

        if (listCalls === 1) {
          return [
            {
              id: 's1',
              startsAt: new Date(startsAt),
              endsAt: new Date('2026-08-20T10:30:00.000Z'),
              status: 'open',
              holdExpiresAt: null,
            },
            {
              id: 's2',
              startsAt: new Date('2026-08-20T10:30:00.000Z'),
              endsAt: new Date('2026-08-20T11:00:00.000Z'),
              status: 'open',
              holdExpiresAt: null,
            },
          ]
        }

        return [
          {
            id: 's1',
            startsAt: new Date(startsAt),
            endsAt: new Date('2026-08-20T10:30:00.000Z'),
            status: 'held',
            holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
          },
          {
            id: 's2',
            startsAt: new Date('2026-08-20T10:30:00.000Z'),
            endsAt: new Date('2026-08-20T11:00:00.000Z'),
            status: 'held',
            holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
          },
        ]
      }),
      createHold: vi.fn().mockResolvedValue({
        id: 'b-win',
        masterId: 'm1',
        clientUserId: 'c1',
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        currency: 'BYN',
        startsAt: new Date(startsAt),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        clientComment: null,
        confirmedAt: null,
        completedAt: null,
        review: null,
        receivedReview: null,
        clientReview: null,
        clientHasAccount: true,
        masterNote: null,
        masterDisplayName: 'Мастер',
        addressHint: null,
        addressExact: null,
        clientName: 'Анна',
        clientPhone: null,
        clientNote: null,
      clientSocialHandle: null,
      }),
    })
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase
    const useCase = new HoldSlotUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    const first = await useCase.execute(
      currentUser,
      { masterId: 'm1', serviceId: 'svc1', startsAt },
      'smoke:1:hold-race-1',
    )

    await expect(
      useCase.execute(
        { ...currentUser, id: 'c2' },
        { masterId: 'm1', serviceId: 'svc1', startsAt },
        'smoke:1:hold-race-2',
      ),
    ).rejects.toMatchObject({ code: 'SLOT_TAKEN' })

    expect(first.bookingId).toBe('b-win')
    expect(store.createHold).toHaveBeenCalledTimes(1)
  })
})
