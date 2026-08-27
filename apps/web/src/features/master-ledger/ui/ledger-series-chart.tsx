'use client'

import cn from 'classnames'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'

import type { LedgerChartPoint } from '@/features/master-ledger/model/build-ledger-series'
import { LedgerChartTooltip } from '@/features/master-ledger/ui/ledger-chart-tooltip'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type LedgerSeriesChartProps = {
  points: LedgerChartPoint[]
}

export function LedgerSeriesChart({ points }: LedgerSeriesChartProps) {
  if (points.length === 0) {
    return null
  }

  return (
    <figure className={styles.chart} data-testid={TEST_ID.ledgerChart}>
      <figcaption className={styles.chartCaption}>Доход и расход</figcaption>
      <div className={styles.chartFrame}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            accessibilityLayer
            barGap={4}
            barCategoryGap="28%"
            margin={{ top: 8, right: 4, left: 4, bottom: 4 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
              tick={{ fill: 'currentColor', fontSize: 13 }}
            />
            <Tooltip
              content={LedgerChartTooltip}
              cursor={{ fill: 'var(--color-surface-2)' }}
            />
            <Bar
              dataKey="income"
              name="Доход"
              fill="var(--color-sage)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expense"
              name="Расход"
              fill="var(--color-accent)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className={styles.chartLegend}>
        <li>
          <span className={cn(styles.swatch, styles.swatchIncome)} />
          доход
        </li>
        <li>
          <span className={cn(styles.swatch, styles.swatchExpense)} />
          расход
        </li>
      </ul>
    </figure>
  )
}
