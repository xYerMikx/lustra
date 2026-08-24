import type { MasterCalendarSlotStatus } from '@lustra/contracts'

export type ScheduleSlotRecord = {
  id: string
  masterId: string
  startsAt: Date
  endsAt: Date
  status: MasterCalendarSlotStatus
  isExtra: boolean
  extraPayAmount: string | null
}

export type SlotOverrideStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  getPolicyGranularityMin(masterId: string): Promise<number | null>
  getDayGranularityMin(
    masterId: string,
    ymdDate: string,
  ): Promise<number | null>
  findSlotById(
    masterId: string,
    slotId: string,
  ): Promise<ScheduleSlotRecord | null>
  findSlotByStart(
    masterId: string,
    startsAt: Date,
  ): Promise<ScheduleSlotRecord | null>
  closeOpenSlot(masterId: string, slotId: string): Promise<boolean>
  reopenClosedSlot(masterId: string, slotId: string): Promise<boolean>
  upsertExtraSlot(input: {
    masterId: string
    startsAt: Date
    endsAt: Date
    extraPayAmount: string
  }): Promise<ScheduleSlotRecord>
}
