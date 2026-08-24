import { Injectable } from '@nestjs/common'
import type { ExceptionType } from '@lustra/contracts'
import { Prisma } from '@lustra/db'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  ScheduleExceptionRecord,
  ScheduleExceptionStore,
  ScheduleExceptionUpsertInput,
} from '@/modules/master-schedule/app/schedule-exception.ports'
import { ymdDateToUtcMidnight } from '@/modules/master-schedule/domain/map-schedule-exception'
import { parseScheduleIntervals } from '@/modules/scheduling/domain/parse-schedule-intervals'

const EXCEPTION_SELECT = {
  id: true,
  masterId: true,
  date: true,
  type: true,
  startMin: true,
  endMin: true,
  granularityMin: true,
  intervals: true,
  note: true,
} as const

@Injectable()
export class ScheduleExceptionRepository implements ScheduleExceptionStore {
  constructor(private readonly prisma: PrismaService) {}

  findMasterIdByUserId(userId: string): Promise<string | null> {
    return this.prisma.masterProfile
      .findUnique({
        where: { userId },
        select: { id: true },
      })
      .then((row) => row?.id ?? null)
  }

  async list(
    masterId: string,
    fromYmdDate: string,
    toYmdDate: string,
  ): Promise<ScheduleExceptionRecord[]> {
    const rows = await this.prisma.availabilityException.findMany({
      where: {
        masterId,
        date: {
          gte: ymdDateToUtcMidnight(fromYmdDate),
          lte: ymdDateToUtcMidnight(toYmdDate),
        },
      },
      select: EXCEPTION_SELECT,
      orderBy: { date: 'asc' },
    })

    return rows.map(toRecord)
  }

  async upsert(
    masterId: string,
    ymdDate: string,
    input: ScheduleExceptionUpsertInput,
  ): Promise<ScheduleExceptionRecord> {
    const date = ymdDateToUtcMidnight(ymdDate)
    const intervals =
      input.intervals == null
        ? Prisma.JsonNull
        : (input.intervals as Prisma.InputJsonValue)
    const row = await this.prisma.availabilityException.upsert({
      where: {
        masterId_date: { masterId, date },
      },
      create: {
        masterId,
        date,
        type: input.type,
        startMin: input.startMin,
        endMin: input.endMin,
        granularityMin: input.granularityMin,
        intervals,
        note: input.note,
      },
      update: {
        type: input.type,
        startMin: input.startMin,
        endMin: input.endMin,
        granularityMin: input.granularityMin,
        intervals,
        note: input.note,
      },
      select: EXCEPTION_SELECT,
    })

    return toRecord(row)
  }

  async delete(masterId: string, ymdDate: string): Promise<boolean> {
    const result = await this.prisma.availabilityException.deleteMany({
      where: {
        masterId,
        date: ymdDateToUtcMidnight(ymdDate),
      },
    })

    return result.count > 0
  }

  countBusySlotsInRange(
    masterId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<number> {
    return this.prisma.timeSlot.count({
      where: {
        masterId,
        status: { in: ['held', 'booked'] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    })
  }
}

function toRecord(row: {
  id: string
  masterId: string
  date: Date
  type: ExceptionType
  startMin: number | null
  endMin: number | null
  granularityMin: number | null
  intervals: unknown
  note: string | null
}): ScheduleExceptionRecord {
  return {
    id: row.id,
    masterId: row.masterId,
    date: row.date,
    type: row.type,
    startMin: row.startMin,
    endMin: row.endMin,
    granularityMin: row.granularityMin,
    intervals: parseScheduleIntervals(row.intervals),
    note: row.note,
  }
}
