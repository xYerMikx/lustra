'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { RescheduleBookingInput } from '@lustra/contracts'

import { formatBookingWhen } from '@/features/booking-cabinets/model/booking-labels'
import { canMarkNoShow } from '@/features/booking-cabinets/model/can-mark-no-show'
import { canRescheduleBooking } from '@/features/booking-cabinets/model/can-reschedule-booking'
import { useMasterBookingDetail } from '@/features/booking-cabinets/model/use-master-bookings'
import { BookingInfoCard } from '@/features/booking-cabinets/ui/booking-info-card'
import { BookingStatusBadge } from '@/features/booking-cabinets/ui/booking-status-badge'
import { ClientSocialLink } from '@/features/booking-cabinets/ui/client-social-link'
import { MasterBookingBackLink } from '@/features/booking-cabinets/ui/master-booking-back-link'
import { toClientSocialLink } from '@/features/booking-cabinets/model/to-client-social-link'
import { RescheduleBookingForm } from '@/features/booking-cabinets/ui/reschedule-booking-form'
import { safeReturnPath } from '@/features/master-calendar/model/calendar-href'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { formatByn } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

const CANCELABLE = new Set(['hold', 'pending', 'confirmed'])

type MasterBookingDetailShellProps = {
  bookingId: string
}

export function MasterBookingDetailShell({
  bookingId,
}: MasterBookingDetailShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const backHref = safeReturnPath(
    searchParams.get('from'),
    '/app/master/bookings',
  )
  const backLabel = backHref.startsWith('/app/master/calendar')
    ? 'К календарю'
    : 'К списку записей'
  const detail = useMasterBookingDetail(bookingId)
  const [reason, setReason] = useState('')

  const submitReschedule = async (input: RescheduleBookingInput) => {
    const next = await detail.reschedule(input)

    if (next) {
      router.push(
        `/app/master/bookings/${next.id}?from=${encodeURIComponent(backHref)}`,
      )
    }
  }

  if (detail.status === 'loading') {
    return <p className={styles.message}>Загружаем запись…</p>
  }

  if (detail.status === 'error' || !detail.booking) {
    return (
      <section className={styles.shell}>
        <p className={styles.error}>{detail.errorMessage ?? 'Запись не найдена'}</p>
        <MasterBookingBackLink href={backHref} label={backLabel} />
      </section>
    )
  }

  const booking = detail.booking
  const canCancel = CANCELABLE.has(booking.status)
  const canConfirm = booking.status === 'pending'
  const canComplete = booking.status === 'confirmed'
  const canNoShow = canMarkNoShow(booking.status)
  const canReschedule = canRescheduleBooking(booking.status)
  const priceLabel = `${formatByn(Number(booking.priceAmount), booking.currency)} · ${booking.serviceDurationMin} мин`
  const socialLink = toClientSocialLink({
    socialHandle: booking.client.socialHandle,
    source: booking.client.source,
    channel: booking.channel,
  })

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageMasterBookingDetail}>
      <header>
        <MasterBookingBackLink href={backHref} label={backLabel} />
        <p className={styles.eyebrow}>Запись клиента</p>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{booking.serviceTitle}</h1>
          <BookingStatusBadge status={booking.status} />
        </div>
      </header>

      <div className={styles.detail}>
        <BookingInfoCard title="Клиент">
          <span className={styles.cardValue}>{booking.client.name}</span>
          {booking.client.phone ? (
            <a className={styles.phoneLink} href={`tel:${booking.client.phone}`}>
              {booking.client.phone}
            </a>
          ) : null}
          {socialLink ? <ClientSocialLink link={socialLink} /> : null}
        </BookingInfoCard>

        <BookingInfoCard title="Визит">
          <span className={styles.cardValue}>
            {formatBookingWhen(booking.startsAt, booking.endsAt)}
          </span>
          <span className={styles.cardHint}>{priceLabel}</span>
        </BookingInfoCard>

        {booking.clientComment ? (
          <BookingInfoCard title="Комментарий клиента">
            <span className={styles.cardHint} data-testid={TEST_ID.masterBookingComment}>
              {booking.clientComment}
            </span>
          </BookingInfoCard>
        ) : null}

        {booking.masterNote ? (
          <BookingInfoCard title="Заметка">
            <span className={styles.cardHint}>{booking.masterNote}</span>
          </BookingInfoCard>
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
          <BookingInfoCard title="Отмена">
            <label className={styles.fieldLabel} htmlFor="master-cancel-reason">
              Причина отмены
            </label>
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
          </BookingInfoCard>
        ) : null}

        {detail.actionError ? (
          <p className={styles.error}>{detail.actionError}</p>
        ) : null}
      </div>
    </section>
  )
}
