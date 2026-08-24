'use client'

import type { CalendarSpan } from '@/features/master-calendar/model/merge-slot-spans'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { DayChip } from '@/features/master-calendar/ui/day-chip'
import { Button } from '@/shared/ui/button'
import { ConfirmPopover } from '@/shared/ui/confirm-popover'
import { TrashIcon } from '@/shared/ui/icon-pack'

type DaySpanChipProps = {
  span: CalendarSpan
  calendarPath: string
  canBook: boolean
  onSelectOpen: (startsAtIso: string) => void
  onCloseSlot: (slotId: string) => void
  onReopenSlot: (slotId: string) => void
}

export function DaySpanChip({
  span,
  calendarPath,
  canBook,
  onSelectOpen,
  onCloseSlot,
  onReopenSlot,
}: DaySpanChipProps) {
  const chip = (
    <DayChip
      span={span}
      calendarPath={calendarPath}
      canBook={canBook}
      onSelectOpen={onSelectOpen}
    />
  )

  if (span.status === 'open' && canBook) {
    return (
      <div className={styles.slotOverride}>
        {chip}
        <ConfirmPopover
          title="Убрать этот слот у клиентов? Блок и обед не создаются."
          confirmLabel="Убрать"
          trigger={<TrashIcon />}
          triggerLabel="Убрать слот"
          onConfirm={() => onCloseSlot(span.id)}
        />
      </div>
    )
  }

  if (span.status === 'closed' && canBook) {
    return (
      <div className={styles.slotOverride}>
        {chip}
        <Button type="button" variant="ghost" onClick={() => onReopenSlot(span.id)}>
          Вернуть
        </Button>
      </div>
    )
  }

  return chip
}
