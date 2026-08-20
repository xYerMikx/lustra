import cn from 'classnames'

import type { ToastRecord } from '@/shared/ui/toast/append-toast'
import { CloseIcon } from '@/shared/ui/close-icon'
import styles from '@/shared/ui/toast/toast.module.css'

type ToastItemProps = {
  toast: ToastRecord
  onDismiss: (id: string) => void
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const isAlert = toast.tone === 'error' || toast.tone === 'warning'

  return (
    <div
      className={cn(
        styles.item,
        styles[toast.tone],
        toast.leaving && styles.leaving,
      )}
      role={isAlert ? 'alert' : 'status'}
    >
      <p className={styles.message}>{toast.message}</p>
      <button
        type="button"
        className={styles.close}
        aria-label="Закрыть уведомление"
        onClick={() => onDismiss(toast.id)}
      >
        <CloseIcon />
      </button>
    </div>
  )
}
