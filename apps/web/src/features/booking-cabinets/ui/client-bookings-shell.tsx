'use client'

import { useState } from 'react'
import cn from 'classnames'

import { useClientSession } from '@/features/auth'
import { formatBookingWhen } from '@/features/booking-cabinets/model/booking-labels'
import { useClientBookingsList } from '@/features/booking-cabinets/model/use-client-bookings'
import { BookingListRow } from '@/features/booking-cabinets/ui/booking-list-row'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { TelegramLinkCard } from '@/features/telegram-link'
import { Button } from '@/shared/ui/button'
import { formatByn } from '@/shared/lib/money'
import { TEST_ID } from '@/shared/lib/test-id'

type Scope = 'upcoming' | 'past'

export function ClientBookingsShell() {
  const session = useClientSession()
  const [scope, setScope] = useState<Scope>('upcoming')
  const list = useClientBookingsList(scope)
  const emptyCopy =
    scope === 'upcoming'
      ? 'Пока нет предстоящих записей. Выберите мастера в каталоге.'
      : 'Прошлых записей пока нет.'

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageClientBookings}>
      <header>
        <p className={styles.eyebrow}>Кабинет клиента</p>
        <h1 className={styles.title}>Мои записи</h1>
      </header>

      <TelegramLinkCard linked={session.telegramLinked} audience="client" />

      <div className={styles.tabs} role="tablist" aria-label="Период">
        <button
          type="button"
          className={cn(styles.tab, scope === 'upcoming' && styles.tabActive)}
          data-testid={TEST_ID.bookingsTabUpcoming}
          onClick={() => setScope('upcoming')}
        >
          Предстоящие
        </button>
        <button
          type="button"
          className={cn(styles.tab, scope === 'past' && styles.tabActive)}
          data-testid={TEST_ID.bookingsTabPast}
          onClick={() => setScope('past')}
        >
          Прошлые
        </button>
      </div>

      {list.status === 'loading' ? (
        <p className={styles.message}>Загружаем записи…</p>
      ) : null}

      {list.status === 'error' ? (
        <div>
          <p className={styles.error}>{list.errorMessage}</p>
          <Button type="button" variant="ghost" onClick={list.reload}>
            Повторить
          </Button>
        </div>
      ) : null}

      {list.status === 'empty' ? (
        <p className={styles.empty}>{emptyCopy}</p>
      ) : null}

      {list.status === 'success' ? (
        <ul className={styles.list} data-testid={TEST_ID.clientBookingsList}>
          {list.items.map((item) => (
            <li key={item.id}>
              <BookingListRow
                href={`/app/client/bookings/${item.id}`}
                bookingId={item.id}
                title={item.serviceTitle}
                person={item.masterDisplayName}
                when={formatBookingWhen(item.startsAt, item.endsAt)}
                price={formatByn(Number(item.priceAmount), item.currency)}
                status={item.status}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
