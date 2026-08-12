'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { MeResponse } from '@lustra/contracts'

import {
  buildAppNavItems,
  initialsFromUser,
} from '@/features/app-shell/model/build-app-nav'
import {
  clearSessionCache,
  loadSession,
} from '@/features/auth/model/load-session'
import { logout } from '@/shared/api/auth-client'
import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

type SessionState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'ready'; user: MeResponse }

export function AppHeader() {
  const router = useRouter()
  const [session, setSession] = useState<SessionState>({ status: 'loading' })
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadSession()
      .then((me) => {
        if (cancelled) {
          return
        }

        if (!me) {
          setSession({ status: 'guest' })

          return
        }

        setSession({ status: 'ready', user: me })
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setSession({ status: 'guest' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const user = session.status === 'ready' ? session.user : null
  const navItems = buildAppNavItems(user)

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      await logout()
    } catch {
      // Still clear local UX even if logout request fails.
    }

    clearSessionCache()
    setSession({ status: 'guest' })
    router.push('/app/login')
    router.refresh()
    setLoggingOut(false)
  }

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        Lustra
      </Link>
      <div className={styles.headerEnd}>
        <nav className={styles.nav} aria-label="Основная навигация">
          {navItems.map((item) => (
            <Link
              key={`${item.href}:${item.label}`}
              href={item.href}
              className={styles.navLink}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {session.status === 'ready' ? (
          <div className={styles.account}>
            <Link
              href="/app"
              className={styles.avatar}
              title={session.user.email}
              aria-label={`Профиль: ${session.user.email}`}
            >
              {initialsFromUser(session.user)}
            </Link>
            <button
              type="button"
              className={styles.logout}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'Выходим…' : 'Выйти'}
            </button>
          </div>
        ) : null}

        {session.status === 'guest' ? (
          <Link href="/app/login" className={styles.loginLink}>
            Войти
          </Link>
        ) : null}
      </div>
    </header>
  )
}
