import {
  PutScheduleExceptionInputSchema,
  type PutScheduleExceptionInput,
} from '@lumira/contracts'

import { minuteOfDayFromHm } from '@/features/master-calendar/model/minute-of-day-from-hm'

export type ExceptionFormValues = {
  date: string
  untilDate: string
  type: PutScheduleExceptionInput['type']
  startTime: string
  endTime: string
  extraWindows: Array<{ startTime: string; endTime: string }>
  granularityMin: '15' | '30' | '60' | ''
  note: string
}

export function toExceptionInput(
  values: ExceptionFormValues,
): PutScheduleExceptionInput | null {
  const note = values.note.trim()
  const untilDate = values.untilDate.trim()

  if (values.type === 'day_off') {
    const parsed = PutScheduleExceptionInputSchema.safeParse({
      type: 'day_off',
      untilDate: untilDate.length > 0 ? untilDate : undefined,
      note: note.length > 0 ? note : undefined,
    })

    if (!parsed.success) {
      return null
    }

    return parsed.data
  }

  const windows = [
    { startTime: values.startTime, endTime: values.endTime },
    ...values.extraWindows,
  ]
  const intervals: Array<{ startMin: number; endMin: number }> = []

  for (const window of windows) {
    const startMin = minuteOfDayFromHm(window.startTime)
    const endMin = minuteOfDayFromHm(window.endTime)

    if (startMin == null || endMin == null) {
      return null
    }

    intervals.push({ startMin, endMin })
  }

  const granularityMin =
    values.granularityMin === ''
      ? undefined
      : Number(values.granularityMin)

  const parsed = PutScheduleExceptionInputSchema.safeParse({
    type: 'custom_hours',
    intervals,
    granularityMin,
    untilDate: untilDate.length > 0 ? untilDate : undefined,
    note: note.length > 0 ? note : undefined,
  })

  if (!parsed.success) {
    return null
  }

  return parsed.data
}
