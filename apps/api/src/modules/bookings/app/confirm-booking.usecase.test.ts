import { describe, expect, it, vi } from 'vitest'

import { FixedClock } from '@/common/time/clock.service'
import { ConfirmBookingUseCase } from '@/modules/bookings/app/confirm-booking.usecase'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'

const actor = {
  id: 'c1',
  role: 'client' as const,
  email: 'client.smoke.1@example.com',
}

function buildStore(overrides: Partial<BookingStore> = {}): BookingStore {
  return {
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
    }),
    findClientActor: vi.fn(),
    findBookingByIdempotencyKey: vi.fn(),
    findBookingById: vi.fn().mockResolvedValue({
      id: 'b1',
      masterId: 'm1',
      clientUserId: 'c1',
      serviceId: 'svc1',
      serviceTitle: 'Маникюр',
      serviceDurationMin: 60,
      priceAmount: '40.00',
      currency: 'BYN',
      startsAt: new Date('2026-08-20T10:00:00.000Z'),
      endsAt: new Date('2026-08-20T11:00:00.000Z'),
      status: 'hold',
      holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
      clientComment: null,
      confirmedAt: null,
      masterNote: 'secret',
    }),
    countActiveBookingsForClient: vi.fn(),
    upsertMasterClient: vi.fn(),
    lockGranulesForUpdate: vi.fn(),
    createHold: vi.fn(),
    confirmHold: vi.fn().mockResolvedValue({
      id: 'b1',
      masterId: 'm1',
      clientUserId: 'c1',
      serviceId: 'svc1',
      serviceTitle: 'Маникюр',
      serviceDurationMin: 60,
      priceAmount: '40.00',
      currency: 'BYN',
      startsAt: new Date('2026-08-20T10:00:00.000Z'),
      endsAt: new Date('2026-08-20T11:00:00.000Z'),
      status: 'confirmed',
      holdExpiresAt: null,
      clientComment: 'ок',
      confirmedAt: new Date('2026-08-12T12:00:00.000Z'),
      masterNote: 'secret',
    }),
    ...overrides,
  }
}

describe('ConfirmBookingUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('confirms own hold and strips private fields', async () => {
    const store = buildStore()
    const useCase = new ConfirmBookingUseCase(
      store,
      { run: vi.fn(async (fn) => fn({})) } as never,
      clock,
    )

    const result = await useCase.execute(actor, 'b1', { comment: 'ок' })

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
      findBookingById: vi.fn().mockResolvedValue({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'other',
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        currency: 'BYN',
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        clientComment: null,
        confirmedAt: null,
        masterNote: null,
      }),
    })
    const useCase = new ConfirmBookingUseCase(
      store,
      { run: vi.fn(async (fn) => fn({})) } as never,
      clock,
    )

    await expect(useCase.execute(actor, 'b1', {})).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  it('rejects expired holds', async () => {
    const store = buildStore({
      findBookingById: vi.fn().mockResolvedValue({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'c1',
        serviceId: 'svc1',
        serviceTitle: 'Маникюр',
        serviceDurationMin: 60,
        priceAmount: '40.00',
        currency: 'BYN',
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        endsAt: new Date('2026-08-20T11:00:00.000Z'),
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T11:59:00.000Z'),
        clientComment: null,
        confirmedAt: null,
        masterNote: null,
      }),
    })
    const useCase = new ConfirmBookingUseCase(
      store,
      { run: vi.fn(async (fn) => fn({})) } as never,
      clock,
    )

    await expect(useCase.execute(actor, 'b1', {})).rejects.toMatchObject({
      code: 'HOLD_EXPIRED',
    })
  })
})
