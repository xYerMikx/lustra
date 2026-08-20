'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import cn from 'classnames'

import { MasterMoreSheet } from '@/features/app-shell/ui/master-more-sheet'
import { MasterNavLink } from '@/features/app-shell/ui/master-nav-link'
import {
  MASTER_WORKSPACE_ALL,
  MASTER_WORKSPACE_MORE,
  MASTER_WORKSPACE_PRIMARY,
  isWorkspaceItemActive,
} from '@/features/app-shell/model/master-workspace-nav'
import { MoreIcon } from '@/shared/ui/icon-pack'
import styles from '@/features/app-shell/ui/master-workspace-nav.module.css'

export function MasterWorkspaceNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = MASTER_WORKSPACE_MORE.some((item) =>
    isWorkspaceItemActive(pathname, item.href),
  )

  return (
    <>
      <nav className={styles.rail} aria-label="Кабинет мастера">
        {MASTER_WORKSPACE_ALL.map((item) => (
          <MasterNavLink
            key={item.href}
            item={item}
            variant="rail"
            active={isWorkspaceItemActive(pathname, item.href)}
          />
        ))}
      </nav>

      <nav className={styles.bottom} aria-label="Кабинет мастера">
        {MASTER_WORKSPACE_PRIMARY.map((item) => (
          <MasterNavLink
            key={item.href}
            item={item}
            variant="tab"
            active={isWorkspaceItemActive(pathname, item.href)}
          />
        ))}
        <button
          type="button"
          className={cn(styles.link, styles.linkTab, moreActive && styles.linkActive)}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(true)}
        >
          <MoreIcon />
          <span>Ещё</span>
        </button>
      </nav>

      {moreOpen ? (
        <MasterMoreSheet
          pathname={pathname}
          onClose={() => setMoreOpen(false)}
        />
      ) : null}
    </>
  )
}
