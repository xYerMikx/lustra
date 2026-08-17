import type { ScheduleExceptionView } from '@lustra/contracts'

import { hmFromMinuteOfDay } from '@/features/master-calendar/model/hm-from-minute-of-day'

export function exceptionSummary(exception: ScheduleExceptionView): string {
  if (exception.type === 'day_off') {
    return 'Выходной'
  }

  if (exception.startMin != null && exception.endMin != null) {
    return `Особые часы ${hmFromMinuteOfDay(exception.startMin)}–${hmFromMinuteOfDay(exception.endMin)}`
  }

  return 'Особые часы'
}
