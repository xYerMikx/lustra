'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'

import { CloseIcon } from '@/shared/ui/close-icon'
import { useDialogA11y } from '@/shared/ui/dialog/use-dialog-a11y'
import styles from '@/shared/ui/dialog/dialog.module.css'

type DialogProps = {
  title: string
  titleId: string
  onClose: () => void
  children: ReactNode
  testId?: string
  closeOnBackdrop?: boolean
}

export function Dialog({
  title,
  titleId,
  onClose,
  children,
  testId,
  closeOnBackdrop = true,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useDialogA11y(panelRef, onClose)

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) {
      return
    }

    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-testid={testId}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.close}
            aria-label="Закрыть"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
