'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path'
import { loadSession } from '@/features/auth/model/load-session'
import { AuthFormPending } from '@/features/auth/ui/auth-form-pending'

type RedirectIfAuthenticatedProps = {
  children: ReactNode
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadSession()
      .then((me) => {
        if (cancelled) {
          return
        }

        if (!me) {
          setIsGuest(true)

          return
        }

        router.replace(resolvePostAuthPath(me, nextPath))
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setIsGuest(true)
      })

    return () => {
      cancelled = true
    }
  }, [nextPath, router])

  if (!isGuest) {
    return <AuthFormPending />
  }

  return children
}
