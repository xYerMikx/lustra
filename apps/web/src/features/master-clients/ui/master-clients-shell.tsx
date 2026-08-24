'use client'

import { useState } from 'react'
import cn from 'classnames'

import { todayYmdDate } from '@/features/master-calendar/model/calendar-range'
import { ManualBookingDialog } from '@/features/master-calendar/ui/manual-booking-dialog'
import { useBookFromClient } from '@/features/master-clients/model/use-book-from-client'
import {
  useMasterClients,
  type ClientsTab,
} from '@/features/master-clients/model/use-master-clients'
import { MasterClientRow } from '@/features/master-clients/ui/master-client-row'
import styles from '@/features/master-clients/ui/master-clients.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

const TABS: Array<{ id: ClientsTab; label: string; testId: string }> = [
  { id: 'search', label: 'Поиск', testId: TEST_ID.clientsTabSearch },
  { id: 'frequent', label: 'Частые', testId: TEST_ID.clientsTabFrequent },
]

export function MasterClientsShell() {
  const [tab, setTab] = useState<ClientsTab>('search')
  const [query, setQuery] = useState('')
  const list = useMasterClients(tab, query)
  const booking = useBookFromClient(list.reload)
  const today = todayYmdDate()

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageMasterClients}>
      <header>
        <p className={styles.eyebrow}>Кабинет мастера</p>
        <h1 className={styles.title}>Клиенты</h1>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Книга клиентов">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cn(styles.tab, tab === item.id && styles.tabActive)}
            data-testid={item.testId}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'search' ? (
        <div className={styles.search}>
          <label className={styles.searchLabel} htmlFor="master-clients-query">
            Имя, телефон или @ник
          </label>
          <input
            id="master-clients-query"
            className={styles.searchInput}
            value={query}
            placeholder="@anna.nails"
            autoComplete="off"
            data-testid={TEST_ID.clientsSearchInput}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      ) : null}

      {booking.notice ? (
        <p
          className={cn(
            styles.notice,
            booking.notice === 'Клиент записан' && styles.noticeSuccess,
          )}
        >
          {booking.notice}
        </p>
      ) : null}

      {list.status === 'idle' ? (
        <p className={styles.empty}>
          Введите имя, телефон или @ник — поиск идёт по книге этого мастера.
        </p>
      ) : null}

      {list.status === 'loading' ? (
        <p className={styles.notice}>Загружаем клиентов…</p>
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
        <p className={styles.empty}>
          {tab === 'frequent'
            ? 'Пока нет завершённых визитов, чтобы собрать частых клиентов.'
            : 'Никого не нашли. Проверьте написание ника без учёта регистра.'}
        </p>
      ) : null}

      {list.status === 'success' ? (
        <ul className={styles.list} data-testid={TEST_ID.clientsList}>
          {list.items.map((client) => (
            <MasterClientRow
              key={client.id}
              client={client}
              busy={booking.busyId === client.id}
              onBook={(next) => {
                void booking.openForClient(next)
              }}
            />
          ))}
        </ul>
      ) : null}

      {booking.dialog ? (
        <ManualBookingDialog
          defaultDate={today}
          defaultStartsAt={null}
          minDate={today}
          services={booking.dialog.services}
          clients={booking.dialog.clients}
          prefillClient={booking.dialog.client}
          onClose={booking.closeDialog}
          onSubmit={booking.submitBooking}
        />
      ) : null}
    </section>
  )
}
