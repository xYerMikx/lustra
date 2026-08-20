'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/shared/ui/confirm-popover/confirm-popover.module.css'

type ConfirmPopoverProps = {
  title: string
  confirmLabel?: string
  cancelLabel?: string
  disabled?: boolean
  trigger: ReactNode
  triggerLabel: string
  testId?: string
  onConfirm: () => void
}

export function ConfirmPopover({
  title,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  disabled = false,
  trigger,
  triggerLabel,
  testId,
  onConfirm,
}: ConfirmPopoverProps) {
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const confirmAction = () => {
    setOpen(false)
    onConfirm()
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <Button
        type="button"
        variant="icon"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={disabled}
        data-testid={testId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </Button>
      {open ? (
        <div
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {cancelLabel}
            </Button>
            <Button
              type="button"
              data-testid={TEST_ID.confirmPopoverConfirm}
              onClick={confirmAction}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
