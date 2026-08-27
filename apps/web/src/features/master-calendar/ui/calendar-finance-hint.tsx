import Link from 'next/link'

import styles from '@/features/master-calendar/ui/calendar.module.css'

export function CalendarFinanceHint() {
  return (
    <p className={styles.financeHint}>
      Завершённый визит попадает в кассу без чаевых.{' '}
      <Link href="/app/master/ledger" className={styles.financeLink}>
        Доход и расходы
      </Link>
    </p>
  )
}
