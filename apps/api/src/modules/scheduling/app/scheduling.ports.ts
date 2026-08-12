import type {
  ScheduleExceptionInput,
  ScheduleRuleInput,
  TimeBlockInput,
} from '@/modules/scheduling/domain/generate-slot-starts'
import type { OpenTimeSlot } from '@/modules/scheduling/domain/build-availability-windows'

export type SchedulingPolicyRecord = {
  granularityMin: number
  minLeadTimeMin: number
  maxHorizonDays: number
  bufferAfterMin: number
}

export type SchedulingServiceRecord = {
  id: string
  masterId: string
  durationMin: number
  bufferAfterMin: number
  isActive: boolean
}

export type SchedulingStore = {
  findMasterExists(masterId: string): Promise<boolean>
  /** True when master is pending_review or published (deep-link / availability). */
  findMasterPubliclyVisible(masterId: string): Promise<boolean>
  findService(masterId: string, serviceId: string): Promise<SchedulingServiceRecord | null>
  getPolicy(masterId: string): Promise<SchedulingPolicyRecord | null>
  listRules(masterId: string): Promise<ScheduleRuleInput[]>
  listExceptions(
    masterId: string,
    fromYmdDate: string,
    toYmdDate: string,
  ): Promise<ScheduleExceptionInput[]>
  listBlocks(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<TimeBlockInput[]>
  listOpenTimeSlots(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<OpenTimeSlot[]>
  upsertOpenTimeSlots(
    masterId: string,
    starts: Date[],
    granularityMin: number,
  ): Promise<void>
  deleteMissingOpenTimeSlots(
    masterId: string,
    rangeFrom: Date,
    rangeTo: Date,
    keepStarts: Date[],
  ): Promise<number>
}
