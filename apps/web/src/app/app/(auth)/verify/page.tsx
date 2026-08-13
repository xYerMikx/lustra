import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { VerifyEmailForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Подтверждение почты',
}

export default function VerifyEmailPage() {
  return (
    <main className={styles.page}>
      <SiteChrome>
        <div className={styles.panelWrap}>
          <section className={styles.panel}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Подтверждение почты</h1>
            <p className={styles.copy}>
              Нажмите кнопку, чтобы подтвердить адрес из письма.
            </p>
            <Suspense fallback={null}>
              <VerifyEmailForm />
            </Suspense>
            <p className={styles.footer}>
              <Link className={styles.footerLink} href="/app/login">
                К входу
              </Link>
            </p>
          </section>
        </div>
      </SiteChrome>
    </main>
  )
}
