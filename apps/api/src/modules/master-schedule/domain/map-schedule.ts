import {
  isGranularityMin,
  type AvailabilityRuleView,
  type MasterSchedulePolicyView,
  type MasterScheduleView,
} from '@lumira/contracts'
import type { AvailabilityRule, MasterBookingPolicy } from '@lumira/db'

export type ScheduleRuleRecord = Pick<
  AvailabilityRule,
  'id' | 'weekday' | 'startMin' | 'endMin'
>

export type SchedulePolicyRecord = Pick<
  MasterBookingPolicy,
  'granularityMin' | 'minLeadTimeMin' | 'maxHorizonDays'
>

export function toAvailabilityRuleView(row: ScheduleRuleRecord): AvailabilityRuleView {
  return {
    id: row.id,
    weekday: row.weekday as AvailabilityRuleView['weekday'],
    startMin: row.startMin,
    endMin: row.endMin,
  }
}

export function toSchedulePolicyView(row: SchedulePolicyRecord): MasterSchedulePolicyView {
  const granularityMin = row.granularityMin

  if (!isGranularityMin(granularityMin)) {
    throw new Error(`Unexpected granularityMin: ${granularityMin}`)
  }

  return {
    granularityMin,
    leadTimeHours: Math.round(row.minLeadTimeMin / 60),
    horizonDays: row.maxHorizonDays,
  }
}

export function toMasterScheduleView(
  rules: ScheduleRuleRecord[],
  policy: SchedulePolicyRecord,
): MasterScheduleView {
  return {
    rules: rules.map(toAvailabilityRuleView),
    policy: toSchedulePolicyView(policy),
  }
}

export function leadTimeHoursToMin(hours: number): number {
  return hours * 60
}
