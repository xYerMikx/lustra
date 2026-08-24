import {
  RescheduleBookingInputSchema,
  type RescheduleBookingInput,
} from '@lustra/contracts'

import { buildManualStartsAt } from '@/features/manual-booking/model/build-manual-starts-at'
import { splitInstantLocal } from '@/features/master-calendar/model/split-instant-local'

export type RescheduleFormValues = {
  date: string
  startTime: string
  reason: string
}

export function buildRescheduleFormDefaults(
  currentStartsAt: string,
): RescheduleFormValues {
  const split = splitInstantLocal(new Date(currentStartsAt))

  return {
    date: split.date,
    startTime: split.time,
    reason: '',
  }
}

export function toRescheduleInput(
  values: RescheduleFormValues,
): RescheduleBookingInput | null {
  const startsAt = buildManualStartsAt(values.date, values.startTime)

  if (!startsAt) {
    return null
  }

  const parsed = RescheduleBookingInputSchema.safeParse({
    startsAt,
    reason: values.reason.trim(),
  })

  if (!parsed.success) {
    return null
  }

  return parsed.data
}
