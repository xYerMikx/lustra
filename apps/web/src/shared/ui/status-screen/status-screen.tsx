import type { ReactNode } from 'react'

import { StatusMark } from '@/shared/ui/status-screen/status-mark'
import styles from '@/shared/ui/status-screen/status-screen.module.css'

type StatusScreenProps = {
  brand?: ReactNode
  kicker?: string
  title: string
  message: string
  actions: ReactNode
  footer?: ReactNode
  testId?: string
}

export function StatusScreen({
  brand,
  kicker,
  title,
  message,
  actions,
  footer,
  testId,
}: StatusScreenProps) {
  return (
    <div className={styles.page} data-testid={testId}>
      {brand ? <div className={styles.brand}>{brand}</div> : null}
      <div className={styles.stack}>
        <section className={styles.card}>
          {kicker ? <p className={styles.kicker}>{kicker}</p> : <StatusMark />}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>{actions}</div>
        </section>
        {footer}
      </div>
    </div>
  )
}
