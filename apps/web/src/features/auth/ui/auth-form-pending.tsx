import styles from '@/features/auth/ui/auth-form.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { Spinner } from '@/shared/ui/spinner'

export function AuthFormPending() {
  return (
    <div
      className={styles.formPending}
      role="status"
      aria-live="polite"
      data-testid={TEST_ID.authFormPending}
    >
      <Spinner className={styles.formPendingSpinner} />
      <p className={styles.formPendingLabel}>Загружаем форму…</p>
    </div>
  )
}
