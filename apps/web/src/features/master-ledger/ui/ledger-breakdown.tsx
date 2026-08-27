import {
  breakdownTickCount,
  type LedgerBreakdownRow,
} from '@/features/master-ledger/model/build-ledger-series'
import { formatByn } from '@/shared/lib/money'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

const TICKS = 10

type LedgerBreakdownProps = {
  rows: LedgerBreakdownRow[]
  currency: string
}

export function LedgerBreakdown({ rows, currency }: LedgerBreakdownProps) {
  if (rows.length === 0) {
    return null
  }

  const max = rows[0]?.amount ?? 0

  return (
    <ul className={styles.breakdown} aria-label="По категориям">
      {rows.map((row) => {
        const filled = breakdownTickCount(row.amount, max, TICKS)
        const tickClass =
          row.kind === 'expense'
            ? `${styles.tick} ${styles.tickOn} ${styles.tickExpense}`
            : `${styles.tick} ${styles.tickOn}`

        return (
          <li key={`${row.kind}-${row.categoryName}`} className={styles.breakdownRow}>
            <div className={styles.breakdownHead}>
              <span>{row.categoryName}</span>
              <span className={styles.breakdownAmount}>
                {row.kind === 'expense' ? '−' : '+'}
                {formatByn(row.amount, currency)}
              </span>
            </div>
            <div className={styles.ticks} aria-hidden="true">
              {Array.from({ length: TICKS }, (_, index) => {
                if (index < filled) {
                  return <span key={index} className={tickClass} />
                }

                return <span key={index} className={styles.tick} />
              })}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
