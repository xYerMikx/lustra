import type { TimeBlockView } from '@lumira/contracts'

import type { TimeBlockRecord } from '@/modules/master-schedule/app/time-block.ports'

export function toTimeBlockView(record: TimeBlockRecord): TimeBlockView {
  return {
    id: record.id,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    reason: record.reason,
    note: record.note,
  }
}
