'use client'

import Link from 'next/link'
import { useState } from 'react'

import {
  bookingStatusLabel,
  formatBookingWhen,
} from '@/features/booking-cabinets/model/booking-labels'
import { useClientBookingDetail } from '@/features/booking-cabinets/model/use-client-bookings'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { ClientReviewPanel } from '@/features/reviews/ui/client-review-panel'
import { Button } from '@/shared/ui/button'
import { formatByn } from '@/shared/lib/money'

const CANCELABLE = new Set(['hold', 'pending', 'confirmed'])

type ClientBookingDetailShellProps = {
  bookingId: string
}

export function ClientBookingDetailShell({
  bookingId,
}: ClientBookingDetailShellProps) {
  const detail = useClientBookingDetail(bookingId)
  const [reason, setReason] = useState('')

  if (detail.status === 'loading') {
    return <p className={styles.message}>Загружаем запись…</p>
  }

  if (detail.status === 'error' || !detail.booking) {
    return (
      <section className={styles.shell}>
        <p className={styles.error}>{detail.errorMessage ?? 'Запись не найдена'}</p>
        <Link className={styles.backLink} href="/app/client/bookings">
          К списку записей
        </Link>
      </section>
    )
  }

  const booking = detail.booking
  const canCancel = CANCELABLE.has(booking.status)

  return (
    <section className={styles.shell}>
      <Link className={styles.backLink} href="/app/client/bookings">
        ← К списку
      </Link>

      <header>
        <p className={styles.eyebrow}>Запись</p>
        <h1 className={styles.title}>{booking.serviceTitle}</h1>
      </header>

      <div className={styles.detail}>
        <div className={styles.detailBlock}>
          <strong>{booking.masterDisplayName}</strong>
          <span className={styles.rowMeta}>
            {formatBookingWhen(booking.startsAt, booking.endsAt)}
          </span>
          <span className={styles.rowMeta}>
            {formatByn(Number(booking.priceAmount), booking.currency)} ·{' '}
            {booking.serviceDurationMin} мин
          </span>
          <span className={styles.status}>
            {bookingStatusLabel(booking.status)}
          </span>
        </div>

        {booking.addressHint || booking.addressExact ? (
          <div className={styles.detailBlock}>
            <strong>Адрес</strong>
            {booking.addressHint ? (
              <span className={styles.rowMeta}>{booking.addressHint}</span>
            ) : null}
            {booking.addressExact ? (
              <span className={styles.rowMeta}>{booking.addressExact}</span>
            ) : null}
          </div>
        ) : null}

        {booking.clientComment ? (
          <div className={styles.detailBlock}>
            <strong>Комментарий</strong>
            <span className={styles.rowMeta}>{booking.clientComment}</span>
          </div>
        ) : null}

        {canCancel ? (
          <div className={styles.detailBlock}>
            <label htmlFor="cancel-reason">Причина отмены (необязательно)</label>
            <input
              id="cancel-reason"
              className={styles.reasonField}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
            />
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                disabled={detail.busy}
                onClick={() => void detail.cancel(reason.trim() || undefined)}
              >
                Отменить запись
              </Button>
            </div>
          </div>
        ) : null}

        <ClientReviewPanel booking={booking} />

        {detail.actionError ? (
          <p className={styles.error}>{detail.actionError}</p>
        ) : null}
      </div>
    </section>
  )
}
