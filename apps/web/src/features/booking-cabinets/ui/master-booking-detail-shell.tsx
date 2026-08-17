'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { RescheduleBookingInput } from '@lustra/contracts'

import {
  bookingStatusLabel,
  formatBookingWhen,
} from '@/features/booking-cabinets/model/booking-labels'
import { canMarkNoShow } from '@/features/booking-cabinets/model/can-mark-no-show'
import { canRescheduleBooking } from '@/features/booking-cabinets/model/can-reschedule-booking'
import { useMasterBookingDetail } from '@/features/booking-cabinets/model/use-master-bookings'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { RescheduleBookingForm } from '@/features/booking-cabinets/ui/reschedule-booking-form'
import { formatByn } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { TEST_ID, bookingStatusTestId } from '@/shared/lib/test-id'

const CANCELABLE = new Set(['hold', 'pending', 'confirmed'])

type MasterBookingDetailShellProps = {
  bookingId: string
}

export function MasterBookingDetailShell({
  bookingId,
}: MasterBookingDetailShellProps) {
  const router = useRouter()
  const detail = useMasterBookingDetail(bookingId)
  const [reason, setReason] = useState('')

  const submitReschedule = async (input: RescheduleBookingInput) => {
    const next = await detail.reschedule(input)

    if (next) {
      router.push(`/app/master/bookings/${next.id}`)
    }
  }

  if (detail.status === 'loading') {
    return <p className={styles.message}>Загружаем запись…</p>
  }

  if (detail.status === 'error' || !detail.booking) {
    return (
      <section className={styles.shell}>
        <p className={styles.error}>{detail.errorMessage ?? 'Запись не найдена'}</p>
        <Link className={styles.backLink} href="/app/master/bookings">
          К списку записей
        </Link>
      </section>
    )
  }

  const booking = detail.booking
  const canCancel = CANCELABLE.has(booking.status)
  const canConfirm = booking.status === 'pending'
  const canComplete = booking.status === 'confirmed'
  const canNoShow = canMarkNoShow(booking.status)
  const canReschedule = canRescheduleBooking(booking.status)

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageMasterBookingDetail}>

      <header>
        <p className={styles.eyebrow}>Запись клиента</p>
        <h1 className={styles.title}>{booking.serviceTitle}</h1>
      </header>

      <div className={styles.detail}>
        <div className={styles.detailBlock}>
          <strong>{booking.client.name}</strong>
          {booking.client.phone ? (
            <span className={styles.rowMeta}>{booking.client.phone}</span>
          ) : null}
          <span className={styles.rowMeta}>
            {formatBookingWhen(booking.startsAt, booking.endsAt)}
          </span>
          <span className={styles.rowMeta}>
            {formatByn(Number(booking.priceAmount), booking.currency)} ·{' '}
            {booking.serviceDurationMin} мин
          </span>
          <span
            className={styles.status}
            data-testid={bookingStatusTestId(booking.status)}
          >
            {bookingStatusLabel(booking.status)}
          </span>
        </div>

        {booking.clientComment ? (
          <div className={styles.detailBlock}>
            <strong>Комментарий клиента</strong>
            <span className={styles.rowMeta} data-testid={TEST_ID.masterBookingComment}>
              {booking.clientComment}
            </span>
          </div>
        ) : null}

        {booking.masterNote ? (
          <div className={styles.detailBlock}>
            <strong>Заметка</strong>
            <span className={styles.rowMeta}>{booking.masterNote}</span>
          </div>
        ) : null}

        <div className={styles.actions}>
          {canConfirm ? (
            <Button
              type="button"
              disabled={detail.busy}
              onClick={() => void detail.confirm()}
              data-testid={TEST_ID.masterBookingConfirm}
            >
              Подтвердить
            </Button>
          ) : null}
          {canComplete ? (
            <Button
              type="button"
              disabled={detail.busy}
              onClick={() => void detail.complete()}
              data-testid={TEST_ID.masterBookingComplete}
            >
              Завершить визит
            </Button>
          ) : null}
          {canNoShow ? (
            <Button
              type="button"
              variant="ghost"
              disabled={detail.busy}
              onClick={() => void detail.markNoShow()}
            >
              Неявка
            </Button>
          ) : null}
        </div>

        {canReschedule ? (
          <RescheduleBookingForm
            currentStartsAt={booking.startsAt}
            busy={detail.busy}
            onSubmit={submitReschedule}
          />
        ) : null}

        {canCancel ? (
          <div className={styles.detailBlock}>
            <label htmlFor="master-cancel-reason">Причина отмены</label>
            <input
              id="master-cancel-reason"
              className={styles.reasonField}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              required
              data-testid={TEST_ID.masterBookingCancelReason}
            />
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                disabled={detail.busy || reason.trim().length === 0}
                onClick={() => void detail.cancel(reason.trim())}
                data-testid={TEST_ID.masterBookingCancelSubmit}
              >
                Отменить запись
              </Button>
            </div>
          </div>
        ) : null}

        {detail.actionError ? (
          <p className={styles.error}>{detail.actionError}</p>
        ) : null}
      </div>
    </section>
  )
}
