import type {
  MasterCalendarSlotStatus,
  MasterCalendarSlotView,
  ScheduleExceptionView,
  TimeBlockView,
} from '@lumira/contracts'
import { isGranularityMin } from '@lumira/contracts'

export type CalendarMasterRecord = {
  id: string
  timezone: string
}

export type CalendarSlotRecord = {
  id: string
  startsAt: Date
  endsAt: Date
  status: MasterCalendarSlotStatus
  clientName: string | null
  bookingId: string | null
  isExtra: boolean
  extraPayAmount: string | null
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
  granularityMin: number | null
  intervals: ScheduleExceptionView['intervals']
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
  const showClientName =
    record.status === 'booked' || record.status === 'held'

  return {
    id: record.id,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    status: record.status,
    clientName: showClientName ? record.clientName : null,
    bookingId:
      record.status === 'booked' || record.status === 'held'
        ? record.bookingId
        : null,
    isExtra: record.isExtra,
    extraPayAmount: record.extraPayAmount,
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
    granularityMin:
      record.granularityMin != null && isGranularityMin(record.granularityMin)
        ? record.granularityMin
        : null,
    intervals: record.intervals,
    note: record.note,
  }
}
