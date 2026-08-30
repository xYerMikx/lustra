'use client'

import type { MasterClientView } from '@lumira/contracts'

import {
  clientContactLine,
  visitsLabel,
} from '@/features/master-clients/model/client-row-copy'
import styles from '@/features/master-clients/ui/master-clients.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

type MasterClientRowProps = {
  client: MasterClientView
  busy: boolean
  onBook: (client: MasterClientView) => void
}

export function MasterClientRow({
  client,
  busy,
  onBook,
}: MasterClientRowProps) {
  const contact = clientContactLine(client)

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <span className={styles.rowTitle}>{client.name}</span>
        <span className={styles.rowMeta}>
          {contact ? `${contact} · ${visitsLabel(client.visitsCount)}` : visitsLabel(client.visitsCount)}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        disabled={busy}
        data-testid={TEST_ID.clientsBookButton}
        onClick={() => onBook(client)}
      >
        {busy ? 'Открываем…' : 'Записать'}
      </Button>
    </li>
  )
}
