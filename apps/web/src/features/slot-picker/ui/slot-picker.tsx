'use client'

import type { PublicServiceView } from '@lustra/contracts'

import { useSlotPicker } from '@/features/slot-picker/model/use-slot-picker'
import { DayStrip } from '@/features/slot-picker/ui/day-strip'
import { ServicePicker } from '@/features/slot-picker/ui/service-picker'
import { SlotChipGrid } from '@/features/slot-picker/ui/slot-chip-grid'
import styles from '@/features/slot-picker/ui/slot-picker.module.css'
import { slotTimeLabel } from '@/features/slot-picker/model/group-slots-by-period'
import { Button } from '@/shared/ui/button'

type SlotPickerProps = {
  masterId: string
  masterSlug: string
  services: PublicServiceView[]
}

export function SlotPicker({
  masterId,
  masterSlug,
  services,
}: SlotPickerProps) {
  const picker = useSlotPicker({ masterId, masterSlug, services })

  if (services.length === 0) {
    return (
      <section className={styles.picker} id="booking">
        <h2 className={styles.title}>Запись</h2>
        <p className={styles.stateBox}>У мастера пока нет активных услуг</p>
      </section>
    )
  }

  return (
    <section className={styles.picker} id="booking">
      <h2 className={styles.title}>Запись</h2>

      <ServicePicker
        services={services}
        selectedServiceId={picker.serviceId}
        onSelect={picker.selectService}
      />

      {picker.status === 'loading' ? (
        <p className={styles.stateBox}>Загружаем свободные окна…</p>
      ) : null}

      {picker.status === 'error' ? (
        <p className={styles.errorBox}>{picker.errorMessage}</p>
      ) : null}

      {picker.status === 'empty' ? (
        <p className={styles.stateBox}>
          На ближайшие 14 дней нет свободных окон для этой услуги
        </p>
      ) : null}

      {picker.status === 'success' || picker.status === 'empty' ? (
        <>
          <DayStrip
            days={picker.days}
            selectedDate={picker.selectedDate}
            onSelect={picker.selectDate}
          />
          {picker.selectedDate ? (
            <SlotChipGrid
              slots={picker.daySlots}
              selectedStartsAt={picker.selectedSlot?.startsAt ?? null}
              timezone={picker.timezone}
              onSelect={picker.selectSlot}
            />
          ) : null}
        </>
      ) : null}

      {picker.selectedSlot ? (
        <div className={styles.selectedSummary}>
          <p className={styles.selectedText}>
            Выбрано:{' '}
            {slotTimeLabel(picker.selectedSlot.startsAt, picker.timezone)} ·{' '}
            {picker.selectedDate}
          </p>
          <Button type="button" onClick={picker.confirmSelection}>
            Записаться
          </Button>
          {picker.draftSaved ? (
            <p className={styles.draftOk}>Слот выбран и сохранён</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
