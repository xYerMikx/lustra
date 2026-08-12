'use client'

import Link from 'next/link'
import { useState } from 'react'
import cn from 'classnames'

import {
  bookingStatusLabel,
  formatBookingWhen,
} from '@/features/booking-cabinets/model/booking-labels'
import { useClientBookingsList } from '@/features/booking-cabinets/model/use-client-bookings'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { Button } from '@/shared/ui/button'
import { formatByn } from '@/shared/lib/money'

type Scope = 'upcoming' | 'past'

export function ClientBookingsShell() {
  const [scope, setScope] = useState<Scope>('upcoming')
  const list = useClientBookingsList(scope)

  return (
    <section className={styles.shell}>
      <header>
        <p className={styles.eyebrow}>Кабинет клиента</p>
        <h1 className={styles.title}>Мои записи</h1>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Период">
        <button
          type="button"
          className={cn(styles.tab, scope === 'upcoming' && styles.tabActive)}
          onClick={() => setScope('upcoming')}
        >
          Предстоящие
        </button>
        <button
          type="button"
          className={cn(styles.tab, scope === 'past' && styles.tabActive)}
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
        <p className={styles.message}>
          {scope === 'upcoming'
            ? 'Пока нет предстоящих записей. Выберите мастера в каталоге.'
            : 'Прошлых записей пока нет.'}
        </p>
      ) : null}

      {list.status === 'success' ? (
        <ul className={styles.list}>
          {list.items.map((item) => (
            <li key={item.id}>
              <Link
                className={styles.row}
                href={`/app/client/bookings/${item.id}`}
              >
                <div className={styles.rowTitle}>{item.serviceTitle}</div>
                <div className={styles.rowMeta}>
                  {item.masterDisplayName} ·{' '}
                  {formatBookingWhen(item.startsAt, item.endsAt)} ·{' '}
                  {formatByn(Number(item.priceAmount), item.currency)}
                </div>
                <div className={styles.status}>
                  {bookingStatusLabel(item.status)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
