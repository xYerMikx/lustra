import { Injectable } from '@nestjs/common'
import { isGranularityMin } from '@lustra/contracts'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  CalendarBlockRecord,
  CalendarMasterRecord,
  CalendarSlotRecord,
  MasterCalendarStore,
} from '@/modules/master-calendar/app/master-calendar.ports'

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
    return this.prisma.timeSlot.findMany({
      where: {
        masterId,
        startsAt: { gte: from, lt: to },
      },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        status: true,
      },
      orderBy: { startsAt: 'asc' },
    })
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
}
