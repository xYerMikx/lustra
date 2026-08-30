'use client'

import type { AvailabilitySlotView } from '@lumira/contracts'
import cn from 'classnames'

import {
  groupSlotsByPeriod,
  slotChipCaption,
  slotTimeLabel,
} from '@/features/slot-picker/model/group-slots-by-period'
import styles from '@/features/slot-picker/ui/slot-picker.module.css'
import { slotChipTestId } from '@/shared/lib/test-id'

type SlotChipGridProps = {
  slots: AvailabilitySlotView[]
  selectedStartsAt: string | null
  justTakenStartsAt?: string | null
  timezone: string
  onSelect: (slot: AvailabilitySlotView) => void
}

export function SlotChipGrid({
  slots,
  selectedStartsAt,
  justTakenStartsAt = null,
  timezone,
  onSelect,
}: SlotChipGridProps) {
  const groups = groupSlotsByPeriod(slots, timezone)

  if (groups.length === 0) {
    return <p className={styles.stateBox}>На этот день свободных окон нет</p>
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.period} className={styles.periodBlock}>
          <p className={styles.periodTitle}>{group.label}</p>
          <div className={styles.slotGrid}>
            {group.slots.map((slot) => (
              <button
                key={slot.startsAt}
                type="button"
                className={cn(
                  styles.slotChip,
                  slot.startsAt === selectedStartsAt && styles.slotChipActive,
                  slot.startsAt === justTakenStartsAt && styles.slotChipTaken,
                )}
                onClick={() => onSelect(slot)}
                data-testid={slotChipTestId(slotTimeLabel(slot.startsAt, timezone))}
              >
                {slotChipCaption(slot, timezone)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
