import type {
  ExceptionType,
  GranularityMin,
  PutScheduleExceptionInput,
} from '@lustra/contracts'

export type ScheduleExceptionRecord = {
  id: string
  masterId: string
  date: Date
  type: ExceptionType
  startMin: number | null
  endMin: number | null
  granularityMin: number | null
  intervals: Array<{ startMin: number; endMin: number }> | null
  note: string | null
}

export type ScheduleExceptionUpsertInput = {
  type: PutScheduleExceptionInput['type']
  startMin: number | null
  endMin: number | null
  granularityMin: GranularityMin | null
  intervals: Array<{ startMin: number; endMin: number }> | null
  note: string | null
}

export type ScheduleExceptionStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  list(
    masterId: string,
    fromYmdDate: string,
    toYmdDate: string,
  ): Promise<ScheduleExceptionRecord[]>
  upsert(
    masterId: string,
    ymdDate: string,
    input: ScheduleExceptionUpsertInput,
  ): Promise<ScheduleExceptionRecord>
  delete(masterId: string, ymdDate: string): Promise<boolean>
  countBusySlotsInRange(
    masterId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<number>
}
