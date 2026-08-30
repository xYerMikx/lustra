'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { MeResponse } from '@lumira/contracts'

import { loadSession } from '@/features/auth/model/load-session'

const SessionContext = createContext<MeResponse | null>(null)

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

    loadSession()
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

  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  )
}

export function useSession(): MeResponse {
  const user = useContext(SessionContext)

  if (!user) {
    throw new Error('useSession must be used within RequireSession')
  }

  return user
}
