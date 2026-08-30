import type { LedgerSummaryView } from '@lumira/contracts'
import cn from 'classnames'

import { formatByn } from '@/shared/lib/money'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

type LedgerSummaryCardsProps = {
  summary: LedgerSummaryView
}

export function LedgerSummaryCards({ summary }: LedgerSummaryCardsProps) {
  const currency = summary.currency

  return (
    <ul className={styles.summary}>
      <li className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Доход</span>
        <strong className={styles.summaryValue}>
          {formatByn(Number(summary.incomeTotal), currency)}
        </strong>
      </li>
      <li className={styles.summaryCard}>
        <span className={styles.summaryLabel}>Расход</span>
        <strong className={styles.summaryValue}>
          {formatByn(Number(summary.expenseTotal), currency)}
        </strong>
      </li>
      <li className={cn(styles.summaryCard, styles.summaryNet)}>
        <span className={styles.summaryLabel}>Итог</span>
        <strong className={styles.summaryValue}>
          {formatByn(Number(summary.netTotal), currency)}
        </strong>
      </li>
    </ul>
  )
}
