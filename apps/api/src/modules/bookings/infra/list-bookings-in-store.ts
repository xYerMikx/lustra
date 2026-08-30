import type { BookingStatus } from '@lumira/contracts'
import type { Prisma } from '@lumira/db'

import type { ListBookingsScope } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

const ACTIVE_STATUSES: BookingStatus[] = ['hold', 'pending', 'confirmed']
const PAST_STATUSES: BookingStatus[] = [
  'completed',
  'cancelled_by_client',
  'cancelled_by_master',
  'no_show',
  'expired',
]

export async function listBookingsForClientInStore(
  db: TxClient,
  input: {
    clientUserId: string
    scope: Exclude<ListBookingsScope, 'pending'>
    now: Date
    limit?: number
  },
): Promise<BookingRecord[]> {
  const take = input.limit ?? 50
  const rows = await db.booking.findMany({
    where:
      input.scope === 'upcoming'
        ? {
            clientUserId: input.clientUserId,
            status: { in: ACTIVE_STATUSES },
            endsAt: { gte: input.now },
          }
        : {
            clientUserId: input.clientUserId,
            OR: [
              { status: { in: PAST_STATUSES } },
              {
                status: { in: ACTIVE_STATUSES },
                endsAt: { lt: input.now },
              },
            ],
          },
    orderBy: { startsAt: input.scope === 'upcoming' ? 'asc' : 'desc' },
    take,
    select: BOOKING_CABINET_SELECT,
  })

  return rows.map(mapBookingRow)
}

export async function listBookingsForMasterInStore(
  db: TxClient,
  input: {
    masterId: string
    scope: ListBookingsScope
    now: Date
    limit?: number
  },
): Promise<BookingRecord[]> {
  const take = input.limit ?? 50
  const where =
    input.scope === 'pending'
      ? { masterId: input.masterId, status: 'pending' as const }
      : input.scope === 'upcoming'
        ? {
            masterId: input.masterId,
            status: { in: ACTIVE_STATUSES },
            endsAt: { gte: input.now },
          }
        : {
            masterId: input.masterId,
            OR: [
              { status: { in: PAST_STATUSES } },
              {
                status: { in: ACTIVE_STATUSES },
                endsAt: { lt: input.now },
              },
            ],
          }

  const rows = await db.booking.findMany({
    where,
    orderBy: {
      startsAt: input.scope === 'past' ? 'desc' : 'asc',
    },
    take,
    select: BOOKING_CABINET_SELECT,
  })

  return rows.map(mapBookingRow)
}
