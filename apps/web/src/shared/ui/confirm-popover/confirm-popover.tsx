'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { placeConfirmPanel } from '@/shared/ui/confirm-popover/place-confirm-panel'
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
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setReady(false)

      return
    }

    const triggerBox = rootRef.current?.getBoundingClientRect()
    const panel = panelRef.current

    if (!triggerBox || !panel) {
      return
    }

    const box = placeConfirmPanel(
      triggerBox,
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
      8,
    )

    panel.style.setProperty('--confirm-top', `${box.top}px`)
    panel.style.setProperty('--confirm-left', `${box.left}px`)
    setReady(true)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }

      setOpen(false)
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
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className={ready ? styles.panelReady : styles.panel}
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
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
