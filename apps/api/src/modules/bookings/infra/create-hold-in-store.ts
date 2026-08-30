import { Prisma } from '@lumira/db'

import { DomainError } from '@/common/errors/domain-error'
import type { CreateHoldInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function createHoldInStore(
  db: TxClient,
  input: CreateHoldInput,
): Promise<BookingRecord> {
  const claimed = await db.timeSlot.updateMany({
    where: {
      id: { in: input.slotIds },
      OR: [
        { status: 'open' },
        {
          status: 'held',
          holdExpiresAt: { lte: input.now },
        },
      ],
    },
    data: {
      status: 'held',
      holdId: input.holdId,
      holdExpiresAt: input.holdExpiresAt,
      version: { increment: 1 },
    },
  })

  if (claimed.count !== input.slotIds.length) {
    throw DomainError.slotTaken()
  }

  const created = await db.booking.create({
    data: {
      masterId: input.masterId,
      masterClientId: input.masterClientId,
      clientUserId: input.clientUserId,
      serviceId: input.serviceId,
      serviceTitle: input.serviceTitle,
      serviceDurationMin: input.serviceDurationMin,
      bufferMin: input.bufferMin,
      priceAmount: new Prisma.Decimal(input.priceAmount),
      currency: input.currency,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: 'hold',
      source: 'client_web',
      holdId: input.holdId,
      holdExpiresAt: input.holdExpiresAt,
      idempotencyKey: input.idempotencyKey,
      createdByUserId: input.clientUserId,
      slots: {
        create: input.slotIds.map((slotId) => ({ slotId })),
      },
      events: {
        create: {
          actorType: 'client',
          actorId: input.clientUserId,
          fromStatus: null,
          toStatus: 'hold',
          payload: { holdId: input.holdId },
        },
      },
    },
    select: { id: true },
  })

  const row = await db.booking.findUnique({
    where: { id: created.id },
    select: BOOKING_CABINET_SELECT,
  })

  if (!row) {
    throw new DomainError('INTERNAL', 'Бронь не найдена после создания')
  }

  return mapBookingRow(row)
}
