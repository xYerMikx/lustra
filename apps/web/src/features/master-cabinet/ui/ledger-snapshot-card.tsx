'use client'

import cn from 'classnames'

import { useLedgerSnapshot } from '@/features/master-cabinet/model/use-ledger-snapshot'
import { formatByn } from '@/shared/lib/money'
import { TEST_ID } from '@/shared/lib/test-id'
import { ButtonLink } from '@/shared/ui/button'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

export function LedgerSnapshotCard() {
  const { summary, status } = useLedgerSnapshot()

  return (
    <div className={styles.section} data-testid={TEST_ID.ledgerSnapshot}>
      <h2 className={styles.sectionTitle}>Финансы за месяц</h2>
      {status === 'success' && summary ? (
        <p className={styles.snapshotValue}>
          {formatByn(Number(summary.netTotal), summary.currency)}
        </p>
      ) : null}
      {status === 'success' && summary ? (
        <p className={styles.hint}>
          Доход {formatByn(Number(summary.incomeTotal), summary.currency)} · расход{' '}
          {formatByn(Number(summary.expenseTotal), summary.currency)}. Визиты
          пишутся сами, чаевые и расходники — вручную.
        </p>
      ) : (
        <p className={styles.hint}>
          Здесь считаются доход с визитов, чаевые и расходы. Клиенты эти цифры не видят.
        </p>
      )}
      <div className={cn(styles.actions, styles.actionsAfter)}>
        <ButtonLink href="/app/master/ledger" variant="ghost" fullWidth>
          Открыть финансы
        </ButtonLink>
      </div>
    </div>
  )
}
