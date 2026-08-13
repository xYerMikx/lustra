'use client'

import Link from 'next/link'
import { useState } from 'react'

import {
  bookingStatusLabel,
  formatBookingWhen,
} from '@/features/booking-cabinets/model/booking-labels'
import { useMasterBookingDetail } from '@/features/booking-cabinets/model/use-master-bookings'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { Button } from '@/shared/ui/button'
import { formatByn } from '@/shared/lib/money'

const CANCELABLE = new Set(['hold', 'pending', 'confirmed'])

type MasterBookingDetailShellProps = {
  bookingId: string
}

export function MasterBookingDetailShell({
  bookingId,
}: MasterBookingDetailShellProps) {
  const detail = useMasterBookingDetail(bookingId)
  const [reason, setReason] = useState('')

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

  return (
    <section className={styles.shell}>
      <Link className={styles.backLink} href="/app/master/bookings">
        ← К списку
      </Link>

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
          <span className={styles.status}>
            {bookingStatusLabel(booking.status)}
          </span>
        </div>

        {booking.clientComment ? (
          <div className={styles.detailBlock}>
            <strong>Комментарий клиента</strong>
            <span className={styles.rowMeta}>{booking.clientComment}</span>
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
            >
              Подтвердить
            </Button>
          ) : null}
          {canComplete ? (
            <Button
              type="button"
              disabled={detail.busy}
              onClick={() => void detail.complete()}
            >
              Завершить визит
            </Button>
          ) : null}
        </div>

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
            />
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                disabled={detail.busy || reason.trim().length === 0}
                onClick={() => void detail.cancel(reason.trim())}
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
