import type { ReactNode } from 'react'

import { AppHeader } from '@/features/app-shell'
import { MasterWorkspaceFrame } from '@/features/app-shell/ui/master-workspace-frame'
import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

type SiteChromeProps = {
  children: ReactNode
}

export function SiteChrome({ children }: SiteChromeProps) {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <MasterWorkspaceFrame>{children}</MasterWorkspaceFrame>
    </div>
  )
}
