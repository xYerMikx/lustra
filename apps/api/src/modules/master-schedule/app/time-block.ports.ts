import type { BlockReason, CreateTimeBlockInput } from '@lustra/contracts'

export type TimeBlockRecord = {
  id: string
  masterId: string
  startsAt: Date
  endsAt: Date
  reason: BlockReason
  note: string | null
}

export type TimeBlockStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  findById(blockId: string): Promise<TimeBlockRecord | null>
  findOverlapping(
    masterId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<TimeBlockRecord | null>
  countBusySlotsInRange(
    masterId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<number>
  create(
    masterId: string,
    actorUserId: string,
    input: {
      startsAt: Date
      endsAt: Date
      reason: CreateTimeBlockInput['reason']
      note?: string
    },
  ): Promise<TimeBlockRecord>
  delete(blockId: string, masterId: string): Promise<boolean>
}
