'use client'

import Link from 'next/link'
import { useState } from 'react'
import cn from 'classnames'

import {
  bookingStatusLabel,
  formatBookingWhen,
} from '@/features/booking-cabinets/model/booking-labels'
import {
  useMasterBookingsList,
  type MasterBookingsScope,
} from '@/features/booking-cabinets/model/use-master-bookings'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { Button } from '@/shared/ui/button'
import { formatByn } from '@/shared/lib/money'
import { TEST_ID, bookingRowTestId, bookingStatusTestId } from '@/shared/lib/test-id'

const SCOPES: Array<{
  id: MasterBookingsScope
  label: string
  testId: string
}> = [
  { id: 'upcoming', label: 'Предстоящие', testId: TEST_ID.bookingsTabUpcoming },
  { id: 'pending', label: 'На подтверждение', testId: TEST_ID.bookingsTabPending },
  { id: 'past', label: 'Прошлые', testId: TEST_ID.bookingsTabPast },
]

export function MasterBookingsShell() {
  const [scope, setScope] = useState<MasterBookingsScope>('upcoming')
  const list = useMasterBookingsList(scope)

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageMasterBookings}>
      <header>
        <p className={styles.eyebrow}>Кабинет мастера</p>
        <h1 className={styles.title}>Записи</h1>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Фильтр записей">
        {SCOPES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(styles.tab, scope === item.id && styles.tabActive)}
            data-testid={item.testId}
            onClick={() => setScope(item.id)}
          >
            {item.label}
          </button>
        ))}
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
        <p className={styles.message}>В этом фильтре записей нет.</p>
      ) : null}

      {list.status === 'success' ? (
        <ul className={styles.list} data-testid={TEST_ID.masterBookingsList}>
          {list.items.map((item) => (
            <li key={item.id}>
              <Link
                className={styles.row}
                href={`/app/master/bookings/${item.id}`}
                data-testid={bookingRowTestId(item.id)}
              >
                <div className={styles.rowTitle}>{item.serviceTitle}</div>
                <div className={styles.rowMeta}>
                  {item.client.name}
                  {item.client.phone ? ` · ${item.client.phone}` : ''} ·{' '}
                  {formatBookingWhen(item.startsAt, item.endsAt)} ·{' '}
                  {formatByn(Number(item.priceAmount), item.currency)}
                </div>
                <div
                  className={styles.status}
                  data-testid={bookingStatusTestId(item.status)}
                >
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
