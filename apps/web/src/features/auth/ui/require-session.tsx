'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import type { MeResponse } from '@lustra/contracts'

import { getMe } from '@/shared/api/auth-client'

type RequireSessionProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireSession({ children, fallback = null }: RequireSessionProps) {
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

        if (!me) {
          router.replace('/app/login')

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

  return children
}
