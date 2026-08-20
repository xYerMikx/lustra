import type { ToastRecord } from '@/shared/ui/toast/append-toast'
import { ToastItem } from '@/shared/ui/toast/toast-item'
import styles from '@/shared/ui/toast/toast.module.css'

type ToastViewportProps = {
  toasts: ToastRecord[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className={styles.viewport} aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
