import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  SchedulingPolicyRecord,
  SchedulingServiceRecord,
  SchedulingStore,
} from '@/modules/scheduling/app/scheduling.ports'
import type { OpenTimeSlot } from '@/modules/scheduling/domain/build-availability-windows'
import type {
  ScheduleExceptionInput,
  ScheduleRuleInput,
  TimeBlockInput,
} from '@/modules/scheduling/domain/generate-slot-starts'
import {
  MASTER_TIMEZONE,
  formatYmdDateInTimeZone,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class SchedulingRepository implements SchedulingStore {
  constructor(private readonly prisma: PrismaService) {}

  async findMasterExists(masterId: string): Promise<boolean> {
    const row = await this.prisma.masterProfile.findUnique({
      where: { id: masterId },
      select: { id: true },
    })

    return Boolean(row)
  }

  async findMasterPubliclyVisible(masterId: string): Promise<boolean> {
    const row = await this.prisma.masterProfile.findFirst({
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
  ): Promise<SchedulingServiceRecord | null> {
    return this.prisma.service.findFirst({
      where: { id: serviceId, masterId },
      select: {
        id: true,
        masterId: true,
        durationMin: true,
        bufferAfterMin: true,
        isActive: true,
      },
    })
  }

  getPolicy(masterId: string): Promise<SchedulingPolicyRecord | null> {
    return this.prisma.masterBookingPolicy.findUnique({
      where: { masterId },
      select: {
        granularityMin: true,
        minLeadTimeMin: true,
        maxHorizonDays: true,
        bufferAfterMin: true,
      },
    })
  }

  async listRules(masterId: string): Promise<ScheduleRuleInput[]> {
    const rows = await this.prisma.availabilityRule.findMany({
      where: { masterId },
      select: {
        weekday: true,
        startMin: true,
        endMin: true,
        activeFrom: true,
        activeTo: true,
      },
    })

    return rows
  }

  async listExceptions(
    masterId: string,
    fromYmdDate: string,
    toYmdDate: string,
  ): Promise<ScheduleExceptionInput[]> {
    const rows = await this.prisma.availabilityException.findMany({
      where: {
        masterId,
        date: {
          gte: new Date(`${fromYmdDate}T00:00:00.000Z`),
          lte: new Date(`${toYmdDate}T00:00:00.000Z`),
        },
      },
      select: {
        date: true,
        type: true,
        startMin: true,
        endMin: true,
      },
    })

    return rows.map((row) => ({
      ymdDate: formatYmdDateInTimeZone(row.date, MASTER_TIMEZONE),
      type: row.type,
      startMin: row.startMin,
      endMin: row.endMin,
    }))
  }

  async listBlocks(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<TimeBlockInput[]> {
    const rows = await this.prisma.timeBlock.findMany({
      where: {
        masterId,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      select: { startsAt: true, endsAt: true },
    })

    return rows
  }

  listOpenTimeSlots(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<OpenTimeSlot[]> {
    return this.prisma.timeSlot.findMany({
      where: {
        masterId,
        status: 'open',
        startsAt: { gte: from, lt: to },
      },
      select: { id: true, startsAt: true, endsAt: true },
      orderBy: { startsAt: 'asc' },
    })
  }

  async upsertOpenTimeSlots(
    masterId: string,
    starts: Date[],
    granularityMin: number,
  ): Promise<void> {
    if (starts.length === 0) {
      return
    }

    await this.prisma.timeSlot.createMany({
      data: starts.map((startsAt) => ({
        masterId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + granularityMin * 60_000),
        status: 'open' as const,
      })),
      skipDuplicates: true,
    })
  }

  async deleteMissingOpenTimeSlots(
    masterId: string,
    rangeFrom: Date,
    rangeTo: Date,
    keepStarts: Date[],
  ): Promise<number> {
    const keepSet = new Set(keepStarts.map((item) => item.toISOString()))
    const openInRange = await this.prisma.timeSlot.findMany({
      where: {
        masterId,
        status: 'open',
        startsAt: { gte: rangeFrom, lt: rangeTo },
        isExtra: false,
      },
      select: { id: true, startsAt: true },
    })

    const toDelete = openInRange
      .filter((row) => !keepSet.has(row.startsAt.toISOString()))
      .map((row) => row.id)

    if (toDelete.length === 0) {
      return 0
    }

    const result = await this.prisma.timeSlot.deleteMany({
      where: { id: { in: toDelete } },
    })

    return result.count
  }
}
