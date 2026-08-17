import type { Metadata } from 'next'
import Link from 'next/link'

import { ForgotPasswordForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Восстановление пароля',
}

export default function ForgotPasswordPage() {
  return (
    <main className={styles.page}>
      <SiteChrome>
        <div className={styles.panelWrap}>
          <section className={styles.panel} data-testid={TEST_ID.pageForgot}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Забыли пароль?</h1>
            <p className={styles.copy}>
              Укажите email — если аккаунт есть, отправим ссылку на сброс.
            </p>
            <ForgotPasswordForm />
            <p className={styles.footer}>
              Вспомнили пароль?{' '}
              <Link className={styles.footerLink} href="/app/login">
                Войти
              </Link>
            </p>
          </section>
        </div>
      </SiteChrome>
    </main>
  )
}
