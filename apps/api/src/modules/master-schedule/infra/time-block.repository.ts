import { Injectable } from '@nestjs/common'
import type { BlockReason } from '@lumira/contracts'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  TimeBlockRecord,
  TimeBlockStore,
} from '@/modules/master-schedule/app/time-block.ports'

@Injectable()
export class TimeBlockRepository implements TimeBlockStore {
  constructor(private readonly prisma: PrismaService) {}

  findMasterIdByUserId(userId: string): Promise<string | null> {
    return this.prisma.masterProfile
      .findUnique({
        where: { userId },
        select: { id: true },
      })
      .then((row) => row?.id ?? null)
  }

  async findById(blockId: string): Promise<TimeBlockRecord | null> {
    const row = await this.prisma.timeBlock.findUnique({
      where: { id: blockId },
      select: {
        id: true,
        masterId: true,
        startsAt: true,
        endsAt: true,
        reason: true,
        note: true,
      },
    })

    return row ? toRecord(row) : null
  }

  async findOverlapping(
    masterId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<TimeBlockRecord | null> {
    const row = await this.prisma.timeBlock.findFirst({
      where: {
        masterId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: {
        id: true,
        masterId: true,
        startsAt: true,
        endsAt: true,
        reason: true,
        note: true,
      },
    })

    return row ? toRecord(row) : null
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

  async create(
    masterId: string,
    currentUserId: string,
    input: {
      startsAt: Date
      endsAt: Date
      reason: BlockReason
      note?: string
    },
  ): Promise<TimeBlockRecord> {
    const row = await this.prisma.timeBlock.create({
      data: {
        masterId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        reason: input.reason,
        note: input.note,
        createdById: currentUserId,
      },
      select: {
        id: true,
        masterId: true,
        startsAt: true,
        endsAt: true,
        reason: true,
        note: true,
      },
    })

    return toRecord(row)
  }

  async delete(blockId: string, masterId: string): Promise<boolean> {
    const result = await this.prisma.timeBlock.deleteMany({
      where: { id: blockId, masterId },
    })

    return result.count > 0
  }
}

function toRecord(row: {
  id: string
  masterId: string
  startsAt: Date
  endsAt: Date
  reason: BlockReason
  note: string | null
}): TimeBlockRecord {
  return {
    id: row.id,
    masterId: row.masterId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    reason: row.reason,
    note: row.note,
  }
}
