import type {
  MasterCalendarSlotStatus,
  MasterCalendarSlotView,
  ScheduleExceptionView,
  TimeBlockView,
} from '@lustra/contracts'

export type CalendarMasterRecord = {
  id: string
  timezone: string
}

export type CalendarSlotRecord = {
  id: string
  startsAt: Date
  endsAt: Date
  status: MasterCalendarSlotStatus
}

export type CalendarBlockRecord = {
  id: string
  startsAt: Date
  endsAt: Date
  reason: TimeBlockView['reason']
  note: string | null
}

export type CalendarExceptionRecord = {
  id: string
  date: Date
  type: ScheduleExceptionView['type']
  startMin: number | null
  endMin: number | null
  note: string | null
}

export type MasterCalendarStore = {
  findMasterByUserId(userId: string): Promise<CalendarMasterRecord | null>
  getGranularityMin(masterId: string): Promise<number | null>
  listSlots(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<CalendarSlotRecord[]>
  listBlocks(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<CalendarBlockRecord[]>
  listExceptions(
    masterId: string,
    fromYmdDate: string,
    toYmdDate: string,
  ): Promise<CalendarExceptionRecord[]>
}

export function toCalendarSlotView(
  record: CalendarSlotRecord,
): MasterCalendarSlotView {
  return {
    id: record.id,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    status: record.status,
  }
}

export function toCalendarBlockView(record: CalendarBlockRecord): TimeBlockView {
  return {
    id: record.id,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    reason: record.reason,
    note: record.note,
  }
}

export function toCalendarExceptionView(
  record: CalendarExceptionRecord,
): ScheduleExceptionView {
  return {
    id: record.id,
    date: record.date.toISOString().slice(0, 10),
    type: record.type,
    startMin: record.startMin,
    endMin: record.endMin,
    note: record.note,
  }
}
