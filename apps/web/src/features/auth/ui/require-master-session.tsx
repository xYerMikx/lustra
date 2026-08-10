'use client'

import { useRouter } from 'next/navigation'
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { MeResponse } from '@lustra/contracts'

import { getMe } from '@/shared/api/auth-client'

type RequireMasterSessionProps = {
  children: (user: MeResponse) => ReactNode
  fallback?: ReactNode
}

/**
 * Master-only gate for `/app/onboarding` and master dashboard routes.
 */
export function RequireMasterSession({
  children,
  fallback = null,
}: RequireMasterSessionProps) {
  const router = useRouter()
  const [user, setUser] = useState<MeResponse | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    getMe()
      .then((me) => {
        if (cancelled) {
          return
        }

        if (me.role !== 'master') {
          router.replace('/app')
          return
        }

        setUser(me)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) {
          return
        }
        router.replace('/app/login')
      })

    return () => {
      cancelled = true
    }
  }, [router])

  if (!ready || !user) {
    return fallback
  }

  return children(user)
}
