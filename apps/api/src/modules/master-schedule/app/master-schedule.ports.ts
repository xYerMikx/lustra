import type { AvailabilityRuleInput } from '@lustra/contracts'

import type {
  SchedulePolicyRecord,
  ScheduleRuleRecord,
} from '@/modules/master-schedule/domain/map-schedule'

export type SchedulePolicyPatch = {
  granularityMin?: 15 | 30 | 60
  minLeadTimeMin?: number
  maxHorizonDays?: number
}

export type MasterScheduleStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  getSchedule(masterId: string): Promise<{
    rules: ScheduleRuleRecord[]
    policy: SchedulePolicyRecord | null
  }>
  replaceRules(
    masterId: string,
    rules: AvailabilityRuleInput[],
    policyPatch?: SchedulePolicyPatch,
  ): Promise<{
    rules: ScheduleRuleRecord[]
    policy: SchedulePolicyRecord
  }>
}
