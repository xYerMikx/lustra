import type { ScheduleExceptionView } from '@lumira/contracts'

import { hmFromMinuteOfDay } from '@/features/master-calendar/model/hm-from-minute-of-day'

export function exceptionSummary(exception: ScheduleExceptionView): string {
  if (exception.type === 'day_off') {
    return 'Выходной'
  }

  const windows = customWindows(exception)

  if (windows.length === 0) {
    return 'Особые часы'
  }

  const hours = windows
    .map(
      (window) =>
        `${hmFromMinuteOfDay(window.startMin)}–${hmFromMinuteOfDay(window.endMin)}`,
    )
    .join(', ')
  const step =
    exception.granularityMin != null
      ? ` · шаг ${exception.granularityMin} мин`
      : ''

  return `Особые часы ${hours}${step}`
}

function customWindows(exception: ScheduleExceptionView) {
  if (exception.intervals && exception.intervals.length > 0) {
    return exception.intervals
  }

  if (exception.startMin != null && exception.endMin != null) {
    return [{ startMin: exception.startMin, endMin: exception.endMin }]
  }

  return []
}
