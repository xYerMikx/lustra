import Link from 'next/link'
import cn from 'classnames'

import { MasterWorkspaceIcon } from '@/features/app-shell/ui/master-workspace-icon'
import type { MasterWorkspaceItem } from '@/features/app-shell/model/master-workspace-nav'
import styles from '@/features/app-shell/ui/master-workspace-nav.module.css'

type MasterNavLinkProps = {
  item: MasterWorkspaceItem
  active: boolean
  variant: 'rail' | 'tab'
}

export function MasterNavLink({ item, active, variant }: MasterNavLinkProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        styles.link,
        variant === 'rail' ? styles.linkRail : styles.linkTab,
        active && styles.linkActive,
      )}
      aria-current={active ? 'page' : undefined}
    >
      <MasterWorkspaceIcon name={item.icon} />
      <span>{item.label}</span>
    </Link>
  )
}
