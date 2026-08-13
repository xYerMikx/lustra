import {
  PutScheduleExceptionInputSchema,
  type PutScheduleExceptionInput,
} from '@lustra/contracts'

import { minuteOfDayFromHm } from '@/features/master-calendar/model/minute-of-day-from-hm'

export type ExceptionFormValues = {
  date: string
  type: PutScheduleExceptionInput['type']
  startTime: string
  endTime: string
  note: string
}

export function toExceptionInput(
  values: ExceptionFormValues,
): PutScheduleExceptionInput | null {
  const note = values.note.trim()

  if (values.type === 'day_off') {
    const parsed = PutScheduleExceptionInputSchema.safeParse({
      type: 'day_off',
      note: note.length > 0 ? note : undefined,
    })

    if (!parsed.success) {
      return null
    }

    return parsed.data
  }

  const startMin = minuteOfDayFromHm(values.startTime)
  const endMin = minuteOfDayFromHm(values.endTime)

  if (startMin == null || endMin == null) {
    return null
  }

  const parsed = PutScheduleExceptionInputSchema.safeParse({
    type: 'custom_hours',
    startMin,
    endMin,
    note: note.length > 0 ? note : undefined,
  })

  if (!parsed.success) {
    return null
  }

  return parsed.data
}
