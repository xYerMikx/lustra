import type { TooltipContentProps } from 'recharts'

import { formatByn } from '@/shared/lib/money'
import styles from '@/features/master-ledger/ui/ledger-chart-tooltip.module.css'

type LedgerChartTooltipProps = Pick<
  TooltipContentProps<number, string>,
  'active' | 'payload' | 'label'
>

export function LedgerChartTooltip({
  active,
  payload,
  label,
}: LedgerChartTooltipProps) {
  if (!active || payload.length === 0) {
    return null
  }

  return (
    <div className={styles.tooltip} role="tooltip">
      <p className={styles.label}>{label}</p>
      <ul className={styles.list}>
        {payload.map((item) => {
          const value = typeof item.value === 'number' ? item.value : 0

          return (
            <li key={String(item.dataKey ?? item.name)} className={styles.row}>
              <span className={styles.name}>{item.name}</span>
              <span>{formatByn(value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
