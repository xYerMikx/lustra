import type {
  ScheduleExceptionInput,
  ScheduleRuleInput,
  TimeBlockInput,
} from '@/modules/scheduling/domain/generate-granules'
import type { OpenGranule } from '@/modules/scheduling/domain/build-availability-windows'

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
  findService(masterId: string, serviceId: string): Promise<SchedulingServiceRecord | null>
  getPolicy(masterId: string): Promise<SchedulingPolicyRecord | null>
  listRules(masterId: string): Promise<ScheduleRuleInput[]>
  listExceptions(
    masterId: string,
    fromYmd: string,
    toYmd: string,
  ): Promise<ScheduleExceptionInput[]>
  listBlocks(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<TimeBlockInput[]>
  listOpenGranules(
    masterId: string,
    from: Date,
    to: Date,
  ): Promise<OpenGranule[]>
  upsertOpenGranules(
    masterId: string,
    starts: Date[],
    granularityMin: number,
  ): Promise<void>
  deleteMissingOpenGranules(
    masterId: string,
    rangeFrom: Date,
    rangeTo: Date,
    keepStarts: Date[],
  ): Promise<number>
}
