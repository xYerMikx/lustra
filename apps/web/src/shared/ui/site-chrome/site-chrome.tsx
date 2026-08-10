import Link from 'next/link'
import type { ReactNode } from 'react'

import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

export type SiteNavItem = {
  href: string
  label: string
}

type SiteHeaderProps = {
  navItems: SiteNavItem[]
}

export function SiteHeader({ navItems }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        Lustra
      </Link>
      <nav className={styles.nav} aria-label="Основная навигация">
        {navItems.map((item) => (
          <Link key={`${item.href}:${item.label}`} href={item.href} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

type SiteChromeProps = {
  children: ReactNode
  navItems: SiteNavItem[]
}

export function SiteChrome({ children, navItems }: SiteChromeProps) {
  return (
    <div className={styles.shell}>
      <SiteHeader navItems={navItems} />
      {children}
    </div>
  )
}
