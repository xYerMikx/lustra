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

const ClientSessionContext = createContext<MeResponse | null>(null)

type RequireClientSessionProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireClientSession({
  children,
  fallback = null,
}: RequireClientSessionProps) {
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

        if (me.role !== 'client') {
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
    <ClientSessionContext.Provider value={user}>
      {children}
    </ClientSessionContext.Provider>
  )
}

export function useClientSession(): MeResponse {
  const user = useContext(ClientSessionContext)

  if (!user) {
    throw new Error('useClientSession must be used within RequireClientSession')
  }

  return user
}
