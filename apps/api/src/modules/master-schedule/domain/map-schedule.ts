import type {
  AvailabilityRuleView,
  MasterSchedulePolicyView,
  MasterScheduleView,
} from '@lustra/contracts'
import type { AvailabilityRule, MasterBookingPolicy } from '@lustra/db'

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

  if (granularityMin !== 15 && granularityMin !== 30 && granularityMin !== 60) {
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
