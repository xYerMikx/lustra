'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import type { OnboardingStep } from '@lustra/contracts'

import { MasterMoreSheet } from '@/features/app-shell/ui/master-more-sheet'
import { MasterNavLink } from '@/features/app-shell/ui/master-nav-link'
import {
  MASTER_WORKSPACE_ALL,
  MASTER_WORKSPACE_MORE,
  MASTER_WORKSPACE_PRIMARY,
  isWorkspaceItemActive,
  workspaceNavItems,
} from '@/features/app-shell/model/master-workspace-nav'
import { MoreIcon } from '@/shared/ui/icon-pack'
import styles from '@/features/app-shell/ui/master-workspace-nav.module.css'

type MasterWorkspaceNavProps = {
  onboardingStep: OnboardingStep | null
}

export function MasterWorkspaceNav({ onboardingStep }: MasterWorkspaceNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreItems = workspaceNavItems(MASTER_WORKSPACE_MORE, onboardingStep)
  const railItems = workspaceNavItems(MASTER_WORKSPACE_ALL, onboardingStep)
  const moreActive = moreItems.some((item) =>
    isWorkspaceItemActive(pathname, item.href),
  )

  return (
    <>
      <nav className={styles.rail} aria-label="Кабинет мастера">
        {railItems.map((item) => (
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
          onboardingStep={onboardingStep}
          onClose={() => setMoreOpen(false)}
        />
      ) : null}
    </>
  )
}
