'use client'

import type { PublicServiceView } from '@lustra/contracts'

import { formatHoldCountdown } from '@/features/slot-picker/model/hold-timer'
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

  if (picker.flowStep === 'success' && picker.booking) {
    return (
      <section className={styles.picker} id="booking">
        <h2 className={styles.title}>Запись оформлена</h2>
        <p className={styles.successText}>
          {picker.booking.serviceTitle} ·{' '}
          {slotTimeLabel(picker.booking.startsAt, picker.timezone)}
        </p>
        <p className={styles.stateBox}>
          Статус: {picker.booking.status === 'confirmed' ? 'подтверждена' : 'ожидает подтверждения мастера'}
        </p>
      </section>
    )
  }

  if (picker.flowStep === 'confirm' && picker.hold) {
    const warnLow = picker.holdRemainingMs > 0 && picker.holdRemainingMs <= 60_000

    return (
      <section className={styles.picker} id="booking">
        <h2 className={styles.title}>Подтверждение</h2>
        <p className={styles.selectedText}>
          {picker.hold.summary.serviceTitle} ·{' '}
          {slotTimeLabel(picker.hold.summary.startsAt, picker.timezone)}
        </p>
        <p className={warnLow ? styles.timerWarn : styles.timer}>
          Место держим {formatHoldCountdown(picker.holdRemainingMs)}
        </p>
        <label className={styles.commentField}>
          <span>Комментарий мастеру</span>
          <textarea
            className={styles.commentInput}
            rows={3}
            maxLength={500}
            value={picker.comment}
            onChange={(event) => picker.setComment(event.target.value)}
          />
        </label>
        {picker.errorMessage ? (
          <p className={styles.errorBox}>{picker.errorMessage}</p>
        ) : null}
        <div className={styles.confirmActions}>
          <Button
            type="button"
            onClick={() => void picker.submitConfirm()}
            disabled={picker.submitting || picker.holdRemainingMs <= 0}
          >
            {picker.submitting ? 'Отправляем…' : 'Подтвердить запись'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={picker.backToPick}
            disabled={picker.submitting}
          >
            Назад
          </Button>
        </div>
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

      {picker.errorMessage && picker.status !== 'error' ? (
        <p className={styles.errorBox}>{picker.errorMessage}</p>
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
              justTakenStartsAt={picker.justTakenStartsAt}
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
          <Button
            type="button"
            onClick={() => void picker.startHold()}
            disabled={picker.submitting}
          >
            {picker.submitting ? 'Удерживаем…' : 'Записаться'}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
