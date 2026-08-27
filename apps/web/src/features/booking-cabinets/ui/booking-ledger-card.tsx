import { formatYmdDateInTimeZone } from '@/shared/lib/tz'
import { TEST_ID } from '@/shared/lib/test-id'
import { ButtonLink } from '@/shared/ui/button'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'

type BookingLedgerCardProps = {
  bookingId: string
  startsAt: string
  priceLabel: string
}

export function BookingLedgerCard({
  bookingId,
  startsAt,
  priceLabel,
}: BookingLedgerCardProps) {
  const occurredOn = formatYmdDateInTimeZone(new Date(startsAt))
  const tipHref = `/app/master/ledger?intent=tip&bookingId=${encodeURIComponent(bookingId)}&occurredOn=${occurredOn}`

  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>Финансы</h2>
      <p className={styles.cardHint}>
        Цена визита ({priceLabel}) уже в доходе. Чаевые — отдельной строкой, если
        клиент оставил.
      </p>
      <div className={styles.actions}>
        <ButtonLink href={tipHref} data-testid={TEST_ID.bookingAddTip}>
          Добавить чаевые
        </ButtonLink>
        <ButtonLink href="/app/master/ledger" variant="ghost">
          Открыть финансы
        </ButtonLink>
      </div>
    </article>
  )
}
