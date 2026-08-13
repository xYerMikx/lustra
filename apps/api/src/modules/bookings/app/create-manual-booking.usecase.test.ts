import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { CreateManualBookingUseCase } from '@/modules/bookings/app/create-manual-booking.usecase'
import { sampleBookingRecord } from '@/modules/bookings/domain/sample-booking-record'
import type { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

const startsAt = '2026-08-20T10:00:00.000Z'

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
    findClientUser: vi.fn(),
    findBookingByIdempotencyKey: vi.fn(),
    findBookingById: vi.fn(),
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
    createManualBooking: vi.fn().mockResolvedValue(
      sampleBookingRecord({
        id: 'b-manual',
        masterId: 'm1',
        clientUserId: null,
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        status: 'confirmed',
        holdExpiresAt: null,
        confirmedAt: new Date('2026-08-12T12:00:00.000Z'),
        startsAt: new Date(startsAt),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
        masterNote: 'из директа',
        clientName: 'Оля',
        clientPhone: '+375291112233',
      }),
    ),
    ...overrides,
  }
}

describe('CreateManualBookingUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('creates a confirmed guest booking and skips client lead-time', async () => {
    const store = buildStore()
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase
    const useCase = new CreateManualBookingUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    const result = await useCase.execute(currentUser, {
      serviceId: 'svc1',
      startsAt: '2026-08-12T12:20:00.000Z',
      clientName: 'Оля',
      phone: '+375291112233',
      channel: 'instagram',
      note: 'из директа',
    })

    expect(result.booking.status).toBe('confirmed')
    expect(result.booking.client.name).toBe('Оля')
    expect(store.createManualBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        masterId: 'm1',
        channel: 'instagram',
        phone: '+375291112233',
        clientName: 'Оля',
      }),
    )
    expect(ensureSlots.execute).toHaveBeenCalled()
  })

  it('rejects when the date is past the booking horizon', async () => {
    const store = buildStore()
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase
    const useCase = new CreateManualBookingUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    await expect(
      useCase.execute(currentUser, {
        serviceId: 'svc1',
        startsAt: '2026-10-01T10:00:00.000Z',
        clientName: 'Оля',
        phone: '+375291112233',
        channel: 'phone',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' })

    expect(store.createManualBooking).not.toHaveBeenCalled()
  })

  it('maps EXCLUDE overlap to TIME_OVERLAP', async () => {
    const store = buildStore({
      createManualBooking: vi.fn().mockRejectedValue({
        code: 'P2004',
        meta: { constraint: 'booking_no_overlap' },
      }),
    })
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase
    const useCase = new CreateManualBookingUseCase(
      store,
      createTransactions(),
      clock,
      ensureSlots,
    )

    await expect(
      useCase.execute(currentUser, {
        serviceId: 'svc1',
        startsAt,
        clientName: 'Оля',
        phone: '+375291112233',
        channel: 'walk_in',
      }),
    ).rejects.toMatchObject({ code: 'TIME_OVERLAP' } satisfies Partial<DomainError>)
  })

  it('hides a missing master profile', async () => {
    const store = buildStore({
      findMasterIdByUserId: vi.fn().mockResolvedValue(null),
    })
    const useCase = new CreateManualBookingUseCase(
      store,
      createTransactions(),
      clock,
      {
        execute: vi.fn(),
      } as unknown as EnsureSlotsUseCase,
    )

    await expect(
      useCase.execute(currentUser, {
        serviceId: 'svc1',
        startsAt,
        clientName: 'Оля',
        phone: '+375291112233',
        channel: 'other',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
