'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import cn from 'classnames'
import type { MeResponse } from '@lumira/contracts'

import {
  buildAppNavItems,
  initialsFromUser,
  isAppNavActive,
} from '@/features/app-shell/model/build-app-nav'
import { isMasterWorkspacePath } from '@/features/app-shell/model/master-workspace-nav'
import {
  clearSessionCache,
  loadSession,
} from '@/features/auth/model/load-session'
import { logout } from '@/shared/api/auth-client'
import { TEST_ID } from '@/shared/lib/test-id'
import { BrandMark } from '@/shared/ui/brand-mark'
import { LogoutIcon } from '@/shared/ui/icon-pack'
import { LandingLink } from '@/shared/ui/landing-link'
import { Spinner } from '@/shared/ui/spinner'
import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

type SessionState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'ready'; user: MeResponse }

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const compact = isMasterWorkspacePath(pathname)
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
  const homeCurrent = isAppNavActive(pathname, '/')
  const loginCurrent = isAppNavActive(pathname, '/app/login')

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
    <header className={cn(styles.header, compact && styles.headerCompact)}>
      <Link
        href="/"
        className={styles.brand}
        aria-label="Lumira, на главную"
        aria-current={homeCurrent ? 'page' : undefined}
      >
        <BrandMark className={styles.brandMark} />
        <span className={styles.brandLabel}>Главная</span>
      </Link>

      <div className={styles.headerEnd}>
        <LandingLink className={cn(styles.navLink, styles.siteLink)}>
          На сайт
        </LandingLink>
        <nav className={styles.nav} aria-label="Основная навигация">
          {navItems.map((item) => {
            const current = isAppNavActive(pathname, item.href)

            return (
              <Link
                key={`${item.href}:${item.label}`}
                href={item.href}
                className={styles.navLink}
                aria-current={current ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
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
              aria-label={loggingOut ? 'Выходим' : 'Выйти'}
              aria-busy={loggingOut}
              title="Выйти"
              data-testid={TEST_ID.appLogout}
            >
              <LogoutIcon />
            </button>
          </div>
        ) : null}

        {session.status === 'loading' ? (
          <span className={styles.headerPending} role="status" aria-label="Загружаем">
            <Spinner />
          </span>
        ) : null}

        {session.status === 'guest' ? (
          <Link
            href="/app/login"
            className={styles.loginLink}
            aria-current={loginCurrent ? 'page' : undefined}
          >
            Войти
          </Link>
        ) : null}
      </div>
    </header>
  )
}
