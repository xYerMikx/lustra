import { Injectable } from '@nestjs/common'
import { Prisma } from '@lustra/db'

import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import type {
  BookingClientUser,
  BookingPolicyRecord,
  BookingServiceRecord,
  BookingStore,
  ConfirmHoldInput,
  CreateHoldInput,
} from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import type { HoldableSlotRow } from '@/modules/bookings/domain/slot-holdability'

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

  async findClientUser(userId: string): Promise<BookingClientUser | null> {
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

  async listGranulesInRange(input: {
    masterId: string
    rangeStart: Date
    rangeEndExclusive: Date
  }): Promise<HoldableSlotRow[]> {
    return this.tx.getClient().timeSlot.findMany({
      where: {
        masterId: input.masterId,
        startsAt: {
          gte: input.rangeStart,
          lt: input.rangeEndExclusive,
        },
      },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        status: true,
        holdExpiresAt: true,
      },
    })
  }

  async createHold(input: CreateHoldInput): Promise<BookingRecord> {
    const db = this.tx.getClient()

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

    return db.booking.create({
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
  }

  async confirmHold(input: ConfirmHoldInput): Promise<BookingRecord | null> {
    const db = this.tx.getClient()

    const updated = await db.booking.updateMany({
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

    const links = await db.bookingSlot.findMany({
      where: { bookingId: input.bookingId },
      select: { slotId: true },
    })

    const slotIds = links.map((link) => link.slotId)

    if (slotIds.length > 0) {
      await db.timeSlot.updateMany({
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

    await db.bookingEvent.create({
      data: {
        bookingId: input.bookingId,
        actorType: 'client',
        actorId: input.clientUserId,
        fromStatus: 'hold',
        toStatus: input.toStatus,
        payload: { comment: input.clientComment },
      },
    })

    await db.outboxEvent.create({
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
