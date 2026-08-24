import { Injectable } from '@nestjs/common'
import { Prisma } from '@lustra/db'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  ScheduleSlotRecord,
  SlotOverrideStore,
} from '@/modules/master-schedule/app/slot-override.ports'
import { ymdDateToUtcMidnight } from '@/modules/master-schedule/domain/map-schedule-exception'

const SLOT_SELECT = {
  id: true,
  masterId: true,
  startsAt: true,
  endsAt: true,
  status: true,
  isExtra: true,
  extraPayAmount: true,
} as const

@Injectable()
export class SlotOverrideRepository implements SlotOverrideStore {
  constructor(private readonly prisma: PrismaService) {}

  findMasterIdByUserId(userId: string): Promise<string | null> {
    return this.prisma.masterProfile
      .findUnique({
        where: { userId },
        select: { id: true },
      })
      .then((row) => row?.id ?? null)
  }

  async getPolicyGranularityMin(masterId: string): Promise<number | null> {
    const policy = await this.prisma.masterBookingPolicy.findUnique({
      where: { masterId },
      select: { granularityMin: true },
    })

    return policy?.granularityMin ?? null
  }

  async getDayGranularityMin(
    masterId: string,
    ymdDate: string,
  ): Promise<number | null> {
    const row = await this.prisma.availabilityException.findUnique({
      where: {
        masterId_date: {
          masterId,
          date: ymdDateToUtcMidnight(ymdDate),
        },
      },
      select: { granularityMin: true },
    })

    return row?.granularityMin ?? null
  }

  async findSlotById(
    masterId: string,
    slotId: string,
  ): Promise<ScheduleSlotRecord | null> {
    const row = await this.prisma.timeSlot.findFirst({
      where: { id: slotId, masterId },
      select: SLOT_SELECT,
    })

    return row ? toSlotRecord(row) : null
  }

  async findSlotByStart(
    masterId: string,
    startsAt: Date,
  ): Promise<ScheduleSlotRecord | null> {
    const row = await this.prisma.timeSlot.findUnique({
      where: { masterId_startsAt: { masterId, startsAt } },
      select: SLOT_SELECT,
    })

    return row ? toSlotRecord(row) : null
  }

  async closeOpenSlot(masterId: string, slotId: string): Promise<boolean> {
    const result = await this.prisma.timeSlot.updateMany({
      where: { id: slotId, masterId, status: 'open' },
      data: { status: 'closed', version: { increment: 1 } },
    })

    return result.count === 1
  }

  async reopenClosedSlot(masterId: string, slotId: string): Promise<boolean> {
    const result = await this.prisma.timeSlot.updateMany({
      where: { id: slotId, masterId, status: 'closed' },
      data: { status: 'open', version: { increment: 1 } },
    })

    return result.count === 1
  }

  async upsertExtraSlot(input: {
    masterId: string
    startsAt: Date
    endsAt: Date
    extraPayAmount: string
  }): Promise<ScheduleSlotRecord> {
    const extraPay = new Prisma.Decimal(input.extraPayAmount)
    const updated = await this.prisma.timeSlot.updateMany({
      where: {
        masterId: input.masterId,
        startsAt: input.startsAt,
        status: { in: ['open', 'closed'] },
      },
      data: {
        endsAt: input.endsAt,
        status: 'open',
        isExtra: true,
        extraPayAmount: extraPay,
        version: { increment: 1 },
      },
    })

    if (updated.count === 1) {
      const row = await this.prisma.timeSlot.findUnique({
        where: {
          masterId_startsAt: {
            masterId: input.masterId,
            startsAt: input.startsAt,
          },
        },
        select: SLOT_SELECT,
      })

      if (!row) {
        throw new Error('EXTRA_SLOT_MISSING_AFTER_UPDATE')
      }

      return toSlotRecord(row)
    }

    try {
      const created = await this.prisma.timeSlot.create({
        data: {
          masterId: input.masterId,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          status: 'open',
          isExtra: true,
          extraPayAmount: extraPay,
        },
        select: SLOT_SELECT,
      })

      return toSlotRecord(created)
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw error
      }

      throw error
    }
  }
}

function toSlotRecord(row: {
  id: string
  masterId: string
  startsAt: Date
  endsAt: Date
  status: ScheduleSlotRecord['status']
  isExtra: boolean
  extraPayAmount: { toString(): string } | null
}): ScheduleSlotRecord {
  return {
    id: row.id,
    masterId: row.masterId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    status: row.status,
    isExtra: row.isExtra,
    extraPayAmount: row.extraPayAmount
      ? Number(row.extraPayAmount.toString()).toFixed(2)
      : null,
  }
}
