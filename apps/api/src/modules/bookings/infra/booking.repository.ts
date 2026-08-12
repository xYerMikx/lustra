import { Injectable } from '@nestjs/common'
import { Prisma } from '@lustra/db'

import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import type {
  BookingClientActor,
  BookingPolicyRecord,
  BookingServiceRecord,
  BookingStore,
  ConfirmHoldInput,
  CreateHoldInput,
} from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import type { HoldableSlotRow } from '@/modules/bookings/domain/slot-holdability'

type SlotLockRow = {
  id: string
  startsAt: Date
  endsAt: Date
  status: HoldableSlotRow['status']
  holdExpiresAt: Date | null
}

const BOOKING_SELECT = {
  id: true,
  masterId: true,
  clientUserId: true,
  serviceId: true,
  serviceTitle: true,
  serviceDurationMin: true,
  priceAmount: true,
  currency: true,
  startsAt: true,
  endsAt: true,
  status: true,
  holdExpiresAt: true,
  clientComment: true,
  confirmedAt: true,
  masterNote: true,
} as const

@Injectable()
export class BookingRepository implements BookingStore {
  constructor(private readonly tx: TransactionManager) {}

  async findMasterPubliclyVisible(masterId: string): Promise<boolean> {
    const row = await this.tx.getClient().masterProfile.findFirst({
      where: {
        id: masterId,
        status: { in: ['pending_review', 'published'] },
      },
      select: { id: true },
    })

    return Boolean(row)
  }

  findService(
    masterId: string,
    serviceId: string,
  ): Promise<BookingServiceRecord | null> {
    return this.tx.getClient().service.findFirst({
      where: { id: serviceId, masterId },
      select: {
        id: true,
        masterId: true,
        title: true,
        durationMin: true,
        bufferAfterMin: true,
        price: true,
        currency: true,
        isActive: true,
      },
    })
  }

  getPolicy(masterId: string): Promise<BookingPolicyRecord | null> {
    return this.tx.getClient().masterBookingPolicy.findUnique({
      where: { masterId },
      select: {
        granularityMin: true,
        minLeadTimeMin: true,
        maxHorizonDays: true,
        bufferAfterMin: true,
        holdTtlSec: true,
        autoConfirm: true,
        maxActiveBookingsPerClient: true,
      },
    })
  }

  async findClientActor(userId: string): Promise<BookingClientActor | null> {
    const row = await this.tx.getClient().user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        phone: true,
        role: true,
      },
    })

    if (!row || row.role !== 'client') {
      return null
    }

    return {
      id: row.id,
      firstName: row.firstName,
      phone: row.phone,
    }
  }

  findBookingByIdempotencyKey(key: string): Promise<BookingRecord | null> {
    return this.tx.getClient().booking.findUnique({
      where: { idempotencyKey: key },
      select: BOOKING_SELECT,
    })
  }

  findBookingById(id: string): Promise<BookingRecord | null> {
    return this.tx.getClient().booking.findUnique({
      where: { id },
      select: BOOKING_SELECT,
    })
  }

  countActiveBookingsForClient(
    masterId: string,
    clientUserId: string,
  ): Promise<number> {
    return this.tx.getClient().booking.count({
      where: {
        masterId,
        clientUserId,
        status: { in: ['hold', 'pending', 'confirmed'] },
      },
    })
  }

  async upsertMasterClient(input: {
    masterId: string
    userId: string
    name: string
    phone: string | null
  }): Promise<{ id: string; isBlocked: boolean }> {
    const existing = await this.tx.getClient().masterClient.findUnique({
      where: {
        masterId_userId: {
          masterId: input.masterId,
          userId: input.userId,
        },
      },
      select: { id: true, isBlocked: true },
    })

    if (existing) {
      return existing
    }

    return this.tx.getClient().masterClient.create({
      data: {
        masterId: input.masterId,
        userId: input.userId,
        name: input.name,
        phone: input.phone,
        source: 'site',
      },
      select: { id: true, isBlocked: true },
    })
  }

  async lockGranulesForUpdate(input: {
    masterId: string
    rangeStart: Date
    rangeEndExclusive: Date
  }): Promise<HoldableSlotRow[]> {
    const rows = await this.tx.getClient().$queryRaw<SlotLockRow[]>`
      SELECT id, "startsAt", "endsAt", status, "holdExpiresAt"
      FROM "TimeSlot"
      WHERE "masterId" = ${input.masterId}
        AND "startsAt" >= ${input.rangeStart}
        AND "startsAt" < ${input.rangeEndExclusive}
      ORDER BY "startsAt"
      FOR UPDATE
    `

    return rows
  }

  async createHold(input: CreateHoldInput): Promise<BookingRecord> {
    const client = this.tx.getClient()

    await client.timeSlot.updateMany({
      where: { id: { in: input.slotIds } },
      data: {
        status: 'held',
        holdId: input.holdId,
        holdExpiresAt: input.holdExpiresAt,
        version: { increment: 1 },
      },
    })

    const booking = await client.booking.create({
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
      select: BOOKING_SELECT,
    })

    return booking
  }

  async confirmHold(input: ConfirmHoldInput): Promise<BookingRecord | null> {
    const client = this.tx.getClient()

    const updated = await client.booking.updateMany({
      where: {
        id: input.bookingId,
        status: 'hold',
        holdExpiresAt: { gt: input.now },
      },
      data: {
        status: input.toStatus,
        clientComment: input.clientComment,
        holdExpiresAt: null,
        confirmedAt: input.confirmedAt,
        version: { increment: 1 },
      },
    })

    if (updated.count === 0) {
      return null
    }

    const links = await client.bookingSlot.findMany({
      where: { bookingId: input.bookingId },
      select: { slotId: true },
    })

    const slotIds = links.map((link) => link.slotId)

    if (slotIds.length > 0) {
      await client.timeSlot.updateMany({
        where: { id: { in: slotIds } },
        data: {
          status: 'booked',
          bookingId: input.bookingId,
          holdId: null,
          holdExpiresAt: null,
          version: { increment: 1 },
        },
      })
    }

    await client.bookingEvent.create({
      data: {
        bookingId: input.bookingId,
        actorType: 'client',
        actorId: input.clientUserId,
        fromStatus: 'hold',
        toStatus: input.toStatus,
        payload: { comment: input.clientComment },
      },
    })

    await client.outboxEvent.create({
      data: {
        type: 'booking.created',
        aggregate: `booking:${input.bookingId}`,
        payload: {
          bookingId: input.bookingId,
          status: input.toStatus,
        },
      },
    })

    return this.findBookingById(input.bookingId)
  }
}
