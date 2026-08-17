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

import { loadSession } from '@/features/auth/model/load-session'

const AdminSessionContext = createContext<MeResponse | null>(null)

type RequireAdminSessionProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireAdminSession({
  children,
  fallback = null,
}: RequireAdminSessionProps) {
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

        if (me.role !== 'admin') {
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

  return (
    <AdminSessionContext.Provider value={user}>
      {children}
    </AdminSessionContext.Provider>
  )
}

export function useAdminSession(): MeResponse {
  const user = useContext(AdminSessionContext)

  if (!user) {
    throw new Error('useAdminSession must be used within RequireAdminSession')
  }

  return user
}
