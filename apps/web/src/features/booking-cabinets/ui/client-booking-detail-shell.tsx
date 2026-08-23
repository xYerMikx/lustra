'use client'

import Link from 'next/link'
import { useState } from 'react'

import { formatBookingWhen } from '@/features/booking-cabinets/model/booking-labels'
import { useClientBookingDetail } from '@/features/booking-cabinets/model/use-client-bookings'
import { BookingCancelWarning } from '@/features/booking-cabinets/ui/booking-cancel-warning'
import { BookingInfoCard } from '@/features/booking-cabinets/ui/booking-info-card'
import { BookingStatusBadge } from '@/features/booking-cabinets/ui/booking-status-badge'
import { ClientReviewPanel } from '@/features/reviews/ui/client-review-panel'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { Button } from '@/shared/ui/button'
import { formatByn } from '@/shared/lib/money'
import { TEST_ID } from '@/shared/lib/test-id'

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
        <p className={styles.error} data-testid={TEST_ID.bookingNotFound}>
          {detail.errorMessage ?? 'Запись не найдена'}
        </p>
        <Link className={styles.backLink} href="/app/client/bookings">
          К списку записей
        </Link>
      </section>
    )
  }

  const booking = detail.booking
  const canCancel = CANCELABLE.has(booking.status)
  const priceLabel = `${formatByn(Number(booking.priceAmount), booking.currency)} · ${booking.serviceDurationMin} мин`

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageClientBookingDetail}>
      <header>
        <p className={styles.eyebrow}>Запись</p>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{booking.serviceTitle}</h1>
          <BookingStatusBadge status={booking.status} />
        </div>
      </header>

      <div className={styles.detail}>
        <BookingInfoCard title="Мастер">
          <span className={styles.cardValue}>{booking.masterDisplayName}</span>
        </BookingInfoCard>

        <BookingInfoCard title="Визит">
          <span className={styles.cardValue}>
            {formatBookingWhen(booking.startsAt, booking.endsAt)}
          </span>
          <span className={styles.cardHint}>{priceLabel}</span>
        </BookingInfoCard>

        {booking.addressHint || booking.addressExact ? (
          <BookingInfoCard title="Адрес">
            {booking.addressHint ? (
              <span className={styles.cardHint}>{booking.addressHint}</span>
            ) : null}
            {booking.addressExact ? (
              <span className={styles.cardHint}>{booking.addressExact}</span>
            ) : null}
          </BookingInfoCard>
        ) : null}

        {booking.clientComment ? (
          <BookingInfoCard title="Комментарий">
            <span className={styles.cardHint}>{booking.clientComment}</span>
          </BookingInfoCard>
        ) : null}

        {canCancel ? (
          <BookingInfoCard title="Отмена">
            <BookingCancelWarning audience="client" />
            <label className={styles.fieldLabel} htmlFor="cancel-reason">
              Причина отмены (необязательно)
            </label>
            <input
              id="cancel-reason"
              className={styles.reasonField}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              data-testid={TEST_ID.clientCancelReason}
            />
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                disabled={detail.busy}
                onClick={() => void detail.cancel(reason.trim() || undefined)}
                data-testid={TEST_ID.clientCancelSubmit}
              >
                Отменить запись
              </Button>
            </div>
          </BookingInfoCard>
        ) : null}

        <ClientReviewPanel booking={booking} />

        {detail.actionError ? (
          <p className={styles.error}>{detail.actionError}</p>
        ) : null}
      </div>
    </section>
  )
}
