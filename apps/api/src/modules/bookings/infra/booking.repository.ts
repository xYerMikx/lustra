import { Injectable } from '@nestjs/common'

import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import type {
  BookingClientUser,
  BookingPolicyRecord,
  BookingServiceRecord,
  BookingStore,
  CancelBookingStoreInput,
  ConfirmHoldInput,
  ConfirmPendingStoreInput,
  CompleteBookingStoreInput,
  CreateHoldInput,
  CreateManualBookingStoreInput,
  ListBookingsScope,
  MasterClientRecord,
  RescheduleBookingStoreInput,
} from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import type { HoldableSlotRow } from '@/modules/bookings/domain/slot-holdability'
import { cancelBookingInStore } from '@/modules/bookings/infra/cancel-booking-in-store'
import { completeBookingInStore } from '@/modules/bookings/infra/complete-booking-in-store'
import { confirmHoldInStore } from '@/modules/bookings/infra/confirm-hold-in-store'
import { createHoldInStore } from '@/modules/bookings/infra/create-hold-in-store'
import { createManualBookingInStore } from '@/modules/bookings/infra/create-manual-booking-in-store'
import { listMasterClientsInStore } from '@/modules/bookings/infra/list-master-clients-in-store'
import { rescheduleBookingInStore } from '@/modules/bookings/infra/reschedule-booking-in-store'
import {
  listBookingsForClientInStore,
  listBookingsForMasterInStore,
} from '@/modules/bookings/infra/list-bookings-in-store'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

@Injectable()
export class BookingRepository implements BookingStore {
  constructor(private readonly tx: TransactionManager) {}

  async findMasterIdByUserId(userId: string): Promise<string | null> {
    const row = await this.tx.getClient().masterProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    return row?.id ?? null
  }

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
        clientCancelCutoffMin: true,
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

  async findBookingByIdempotencyKey(key: string): Promise<BookingRecord | null> {
    const row = await this.tx.getClient().booking.findUnique({
      where: { idempotencyKey: key },
      select: BOOKING_CABINET_SELECT,
    })

    return row ? mapBookingRow(row) : null
  }

  async findBookingById(id: string): Promise<BookingRecord | null> {
    const row = await this.tx.getClient().booking.findUnique({
      where: { id },
      select: BOOKING_CABINET_SELECT,
    })

    return row ? mapBookingRow(row) : null
  }

  listBookingsForClient(input: {
    clientUserId: string
    scope: Exclude<ListBookingsScope, 'pending'>
    now: Date
    limit?: number
  }): Promise<BookingRecord[]> {
    return listBookingsForClientInStore(this.tx.getClient(), input)
  }

  listBookingsForMaster(input: {
    masterId: string
    scope: ListBookingsScope
    now: Date
    limit?: number
  }): Promise<BookingRecord[]> {
    return listBookingsForMasterInStore(this.tx.getClient(), input)
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

  listGranulesInRange(input: {
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

  createHold(input: CreateHoldInput): Promise<BookingRecord> {
    return createHoldInStore(this.tx.getClient(), input)
  }

  confirmHold(input: ConfirmHoldInput): Promise<BookingRecord | null> {
    return confirmHoldInStore(this.tx.getClient(), input)
  }

  cancelBooking(input: CancelBookingStoreInput): Promise<BookingRecord | null> {
    return cancelBookingInStore(this.tx.getClient(), input)
  }

  createManualBooking(
    input: CreateManualBookingStoreInput,
  ): Promise<BookingRecord> {
    return createManualBookingInStore(this.tx.getClient(), input)
  }

  rescheduleBooking(
    input: RescheduleBookingStoreInput,
  ): Promise<BookingRecord | null> {
    return rescheduleBookingInStore(this.tx.getClient(), input)
  }

  listMasterClients(input: {
    masterId: string
    query: string
    limit?: number
  }): Promise<MasterClientRecord[]> {
    return listMasterClientsInStore(this.tx.getClient(), input)
  }

  async confirmPending(
    input: ConfirmPendingStoreInput,
  ): Promise<BookingRecord | null> {
    const db = this.tx.getClient()

    const updated = await db.booking.updateMany({
      where: {
        id: input.bookingId,
        masterId: input.masterId,
        status: 'pending',
      },
      data: {
        status: 'confirmed',
        confirmedAt: input.now,
        version: { increment: 1 },
      },
    })

    if (updated.count === 0) {
      return null
    }

    await db.bookingEvent.create({
      data: {
        bookingId: input.bookingId,
        actorType: 'master',
        actorId: input.currentUserId,
        fromStatus: 'pending',
        toStatus: 'confirmed',
        payload: {},
      },
    })

    return this.findBookingById(input.bookingId)
  }

  completeBooking(
    input: CompleteBookingStoreInput,
  ): Promise<BookingRecord | null> {
    return completeBookingInStore(this.tx.getClient(), input)
  }
}
