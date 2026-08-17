'use client'

import Link from 'next/link'
import cn from 'classnames'

import {
  ADMIN_QUEUE_TABS,
  type AdminQueueTab,
} from '@/features/admin-moderation/model/admin-queue-tabs'
import styles from '@/features/admin-moderation/ui/admin-moderation.module.css'

type AdminQueueNavProps = {
  active: AdminQueueTab
}

export function AdminQueueNav({ active }: AdminQueueNavProps) {
  return (
    <nav className={styles.tabs} aria-label="Очереди модерации">
      {ADMIN_QUEUE_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(styles.tab, tab.id === active && styles.tabActive)}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
