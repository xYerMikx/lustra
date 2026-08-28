'use client'

import Link from 'next/link'
import cn from 'classnames'
import type { OnboardingStep } from '@lustra/contracts'

import { MasterNavLink } from '@/features/app-shell/ui/master-nav-link'
import {
  MASTER_WORKSPACE_MORE,
  isWorkspaceItemActive,
  workspaceNavItems,
} from '@/features/app-shell/model/master-workspace-nav'
import { Button } from '@/shared/ui/button'
import { CatalogIcon, HomeIcon } from '@/shared/ui/icon-pack'
import { LandingLink } from '@/shared/ui/landing-link'
import styles from '@/features/app-shell/ui/master-workspace-nav.module.css'

type MasterMoreSheetProps = {
  pathname: string
  onboardingStep: OnboardingStep | null
  onClose: () => void
}

export function MasterMoreSheet({
  pathname,
  onboardingStep,
  onClose,
}: MasterMoreSheetProps) {
  const items = workspaceNavItems(MASTER_WORKSPACE_MORE, onboardingStep)

  return (
    <div className={styles.sheetBackdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="master-more-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="master-more-title" className={styles.sheetTitle}>
          Ещё
        </h2>
        <nav className={styles.sheetNav} aria-label="Дополнительно">
          {items.map((item) => (
            <MasterNavLink
              key={item.href}
              item={item}
              variant="rail"
              active={isWorkspaceItemActive(pathname, item.href)}
            />
          ))}
          <Link href="/catalog" className={cn(styles.link, styles.linkRail)}>
            <CatalogIcon />
            <span>Каталог</span>
          </Link>
          <LandingLink className={cn(styles.link, styles.linkRail)}>
            <HomeIcon />
            <span>На сайт</span>
          </LandingLink>
        </nav>
        <Button type="button" variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </div>
  )
}
