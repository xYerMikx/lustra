import {
  isLedgerChartLabelVisible,
  ledgerBarHeight,
  ledgerSeriesMax,
  type LedgerChartPoint,
} from '@/features/master-ledger/model/build-ledger-series'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

const CHART_HEIGHT = 120
const CHART_WIDTH = 100

type LedgerSeriesChartProps = {
  points: LedgerChartPoint[]
}

export function LedgerSeriesChart({ points }: LedgerSeriesChartProps) {
  if (points.length === 0) {
    return null
  }

  const max = ledgerSeriesMax(points)
  const groupWidth = CHART_WIDTH / points.length
  const barWidth = Math.max(groupWidth * 0.36, 0.8)
  const gap = Math.max((groupWidth - barWidth * 2) / 3, 0.2)

  return (
    <figure className={styles.chart} data-testid={TEST_ID.ledgerChart}>
      <figcaption className={styles.chartCaption}>Доход и расход</figcaption>
      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label="График дохода и расхода за период"
      >
        <line
          className={styles.chartBase}
          x1="0"
          y1={CHART_HEIGHT - 0.4}
          x2={CHART_WIDTH}
          y2={CHART_HEIGHT - 0.4}
        />
        {points.map((point, index) => {
          const origin = index * groupWidth + gap
          const incomeHeight = ledgerBarHeight(point.income, max, CHART_HEIGHT - 4)
          const expenseHeight = ledgerBarHeight(point.expense, max, CHART_HEIGHT - 4)

          return (
            <g key={point.key}>
              <rect
                className={styles.barIncome}
                x={origin}
                y={CHART_HEIGHT - incomeHeight}
                width={barWidth}
                height={incomeHeight}
                rx="0.6"
              >
                <title>
                  {point.label}: доход {point.income}
                </title>
              </rect>
              <rect
                className={styles.barExpense}
                x={origin + barWidth + gap}
                y={CHART_HEIGHT - expenseHeight}
                width={barWidth}
                height={expenseHeight}
                rx="0.6"
              >
                <title>
                  {point.label}: расход {point.expense}
                </title>
              </rect>
            </g>
          )
        })}
      </svg>
      <ul className={styles.chartLegend}>
        <li>
          <span className={`${styles.swatch} ${styles.swatchIncome}`} />
          доход
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchExpense}`} />
          расход
        </li>
      </ul>
      <ul className={styles.chartLabels}>
        {points.map((point, index) => {
          if (!isLedgerChartLabelVisible(index, points.length)) {
            return <li key={point.key} />
          }

          return <li key={point.key}>{point.label}</li>
        })}
      </ul>
    </figure>
  )
}
