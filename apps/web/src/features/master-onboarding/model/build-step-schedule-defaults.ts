import type {
  MasterScheduleView,
  PutMasterScheduleInput,
} from '@lumira/contracts'

import { SCHEDULE_PRESETS } from '@/features/master-onboarding/model/schedule-presets'

export function buildStepScheduleDefaults(
  initial: MasterScheduleView | null,
): PutMasterScheduleInput {
  if (initial && initial.rules.length > 0) {
    return {
      rules: initial.rules.map((rule) => ({
        weekday: rule.weekday,
        startMin: rule.startMin,
        endMin: rule.endMin,
      })),
      policy: {
        granularityMin: initial.policy.granularityMin,
        leadTimeHours: initial.policy.leadTimeHours,
        horizonDays: initial.policy.horizonDays,
      },
    }
  }

  const weekdaysPreset = SCHEDULE_PRESETS.find(
    (preset) => preset.id === 'weekdays-10-20',
  )

  return {
    rules: weekdaysPreset?.build() ?? [],
    policy: {
      granularityMin: initial?.policy.granularityMin ?? 30,
      leadTimeHours: initial?.policy.leadTimeHours ?? 3,
      horizonDays: initial?.policy.horizonDays ?? 30,
    },
  }
}
