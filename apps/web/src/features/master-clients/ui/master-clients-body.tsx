'use client'

import type { MasterClientView } from '@lumira/contracts'

import { CLIENTS_LIST_COPY } from '@/features/master-clients/model/clients-list-copy'
import type {
  ClientsTab,
  ListStatus,
} from '@/features/master-clients/model/use-master-clients'
import { MasterClientRow } from '@/features/master-clients/ui/master-client-row'
import styles from '@/features/master-clients/ui/master-clients.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

type MasterClientsBodyProps = {
  status: ListStatus
  tab: ClientsTab
  errorMessage: string | null
  items: MasterClientView[]
  busyId: string | null
  onRetry: () => void
  onBook: (client: MasterClientView) => void
}

export function MasterClientsBody({
  status,
  tab,
  errorMessage,
  items,
  busyId,
  onRetry,
  onBook,
}: MasterClientsBodyProps) {
  if (status === 'idle') {
    return <p className={styles.empty}>{CLIENTS_LIST_COPY.idle}</p>
  }

  if (status === 'loading') {
    return <p className={styles.notice}>{CLIENTS_LIST_COPY.loading}</p>
  }

  if (status === 'error') {
    return (
      <div>
        <p className={styles.error}>{errorMessage}</p>
        <Button type="button" variant="ghost" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    )
  }

  if (status === 'empty') {
    return <p className={styles.empty}>{CLIENTS_LIST_COPY.empty[tab]}</p>
  }

  return (
    <ul className={styles.list} data-testid={TEST_ID.clientsList}>
      {items.map((client) => (
        <MasterClientRow
          key={client.id}
          client={client}
          busy={busyId === client.id}
          onBook={onBook}
        />
      ))}
    </ul>
  )
}
