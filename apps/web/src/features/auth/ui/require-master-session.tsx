'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { MeResponse } from '@lustra/contracts'

import { getMe } from '@/shared/api/auth-client'

const MasterSessionContext = createContext<MeResponse | null>(null)

type RequireMasterSessionProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireMasterSession({
  children,
  fallback = null,
}: RequireMasterSessionProps) {
  const router = useRouter()
  const [user, setUser] = useState<MeResponse | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const me = await getMe()

        if (cancelled) {
          return
        }

        if (!me) {
          router.replace('/app/login')

          return
        }

        if (me.role !== 'master') {
          router.replace('/app')

          return
        }

        setUser(me)
        setReady(true)
      } catch {
        if (cancelled) {
          return
        }

        router.replace('/app/login')
      }
    }

    void loadSession()

    return () => {
      cancelled = true
    }
  }, [router])

  if (!ready || !user) {
    return fallback
  }

  return (
    <MasterSessionContext.Provider value={user}>
      {children}
    </MasterSessionContext.Provider>
  )
}

export function useMasterSession(): MeResponse {
  const user = useContext(MasterSessionContext)

  if (!user) {
    throw new Error('useMasterSession must be used within RequireMasterSession')
  }

  return user
}
