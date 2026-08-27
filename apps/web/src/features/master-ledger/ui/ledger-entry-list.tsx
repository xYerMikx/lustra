import type { LedgerEntryView } from '@lustra/contracts'

import { formatByn } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

type LedgerEntryListProps = {
  items: LedgerEntryView[]
  onRemove: (item: LedgerEntryView) => void
}

export function LedgerEntryList({ items, onRemove }: LedgerEntryListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const amountClass =
          item.kind === 'expense' ? styles.expense : styles.income
        const sign = item.kind === 'expense' ? '−' : '+'

        return (
          <li key={item.id} className={styles.row}>
            <div>
              <p className={styles.rowTitle}>
                {item.kind === 'income' ? 'Доход' : 'Расход'} · {item.categoryName}
              </p>
              <p className={styles.meta}>
                {item.occurredOn}
                {item.serviceTitle ? ` · ${item.serviceTitle}` : ''}
                {item.note ? ` · ${item.note}` : ''}
                {item.source === 'booking' ? ' · визит' : ''}
              </p>
            </div>
            <div className={styles.rowAmount}>
              <span className={amountClass}>
                {sign}
                {formatByn(Number(item.amount), item.currency)}
              </span>
              {item.source === 'manual' ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onRemove(item)}
                >
                  Удалить
                </Button>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
