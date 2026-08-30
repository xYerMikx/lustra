import { Injectable } from '@nestjs/common'
import { isGranularityMin } from '@lumira/contracts'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  CalendarBlockRecord,
  CalendarExceptionRecord,
  CalendarMasterRecord,
  CalendarSlotRecord,
  MasterCalendarStore,
} from '@/modules/master-calendar/app/master-calendar.ports'
import { ymdDateToUtcMidnight } from '@/modules/master-schedule/domain/map-schedule-exception'
import { parseScheduleIntervals } from '@/modules/scheduling/domain/parse-schedule-intervals'

@Injectable()
export class MasterCalendarRepository implements MasterCalendarStore {
  constructor(private readonly prisma: PrismaService) {}

  async findMasterByUserId(
    userId: string,
  ): Promise<CalendarMasterRecord | null> {
    const row = await this.prisma.masterProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        user: { select: { timezone: true } },
      },
    })

    if (!row) {
      return null
    }

    return { id: row.id, timezone: row.user.timezone }
  }

  async getGranularityMin(masterId: string): Promise<number | null> {
    const policy = await this.prisma.masterBookingPolicy.findUnique({
      where: { masterId },
      select: { granularityMin: true },
    })

    if (!policy) {
      return null
    }

    return isGranularityMin(policy.granularityMin)
      ? policy.granularityMin
      : null
  }

  listSlots(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<CalendarSlotRecord[]> {
    return this.prisma.timeSlot
      .findMany({
        where: {
          masterId,
          startsAt: { gte: from, lt: to },
        },
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          status: true,
          isExtra: true,
          extraPayAmount: true,
          bookingLinks: {
            take: 1,
            select: {
              booking: {
                select: {
                  id: true,
                  masterClient: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { startsAt: 'asc' },
      })
      .then((rows) =>
        rows.map((row) => ({
          id: row.id,
          startsAt: row.startsAt,
          endsAt: row.endsAt,
          status: row.status,
          isExtra: row.isExtra,
          extraPayAmount: row.extraPayAmount
            ? Number(row.extraPayAmount).toFixed(2)
            : null,
          clientName: row.bookingLinks[0]?.booking.masterClient.name ?? null,
          bookingId: row.bookingLinks[0]?.booking.id ?? null,
        })),
      )
  }

  listBlocks(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<CalendarBlockRecord[]> {
    return this.prisma.timeBlock.findMany({
      where: {
        masterId,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        reason: true,
        note: true,
      },
      orderBy: { startsAt: 'asc' },
    })
  }

  listExceptions(
    masterId: string,
    fromYmdDate: string,
    toYmdDate: string,
  ): Promise<CalendarExceptionRecord[]> {
    return this.prisma.availabilityException.findMany({
      where: {
        masterId,
        date: {
          gte: ymdDateToUtcMidnight(fromYmdDate),
          lte: ymdDateToUtcMidnight(toYmdDate),
        },
      },
      select: {
        id: true,
        date: true,
        type: true,
        startMin: true,
        endMin: true,
        granularityMin: true,
        intervals: true,
        note: true,
      },
      orderBy: { date: 'asc' },
    })
    .then((rows) =>
      rows.map((row) => ({
        id: row.id,
        date: row.date,
        type: row.type,
        startMin: row.startMin,
        endMin: row.endMin,
        granularityMin:
          row.granularityMin != null && isGranularityMin(row.granularityMin)
            ? row.granularityMin
            : null,
        intervals: parseScheduleIntervals(row.intervals),
        note: row.note,
      })),
    )
  }
}
