import type { ReactNode } from 'react'

import { AppHeader } from '@/features/app-shell'
import { MasterWorkspaceFrame } from '@/features/app-shell/ui/master-workspace-frame'
import { LegalFooter } from '@/shared/ui/legal-footer'
import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

type SiteChromeProps = {
  children: ReactNode
}

export function SiteChrome({ children }: SiteChromeProps) {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <div className={styles.body}>
        <MasterWorkspaceFrame>{children}</MasterWorkspaceFrame>
      </div>
      <LegalFooter />
    </div>
  )
}
