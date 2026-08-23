'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import type { MeResponse } from '@lustra/contracts'

import { loadSession } from '@/features/auth/model/load-session'
import { isMasterWorkspacePath } from '@/features/app-shell/model/master-workspace-nav'
import { MasterWorkspaceNav } from '@/features/app-shell/ui/master-workspace-nav'
import styles from '@/features/app-shell/ui/master-workspace-nav.module.css'

type MasterWorkspaceFrameProps = {
  children: ReactNode
}

export function MasterWorkspaceFrame({ children }: MasterWorkspaceFrameProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<MeResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    loadSession()
      .then((me) => {
        if (!cancelled) {
          setUser(me)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  const showNav =
    user?.role === 'master' && isMasterWorkspacePath(pathname)

  if (!showNav) {
    return children
  }

  return (
    <div className={cn(styles.frame, styles.frameNav)}>
      <MasterWorkspaceNav onboardingStep={user.onboardingStep} />
      <div>{children}</div>
    </div>
  )
}
