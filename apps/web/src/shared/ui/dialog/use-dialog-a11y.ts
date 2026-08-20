'use client'

import { useEffect, useRef, type RefObject } from 'react'

import { cycleTabIndex } from '@/shared/ui/dialog/cycle-tab-index'

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function listTabbable(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) => element.tabIndex !== -1,
  )
}

export function useDialogA11y(
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const panel = panelRef.current

    if (!panel) {
      return
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const initial = listTabbable(panel)[0]

    if (initial) {
      initial.focus()
    } else {
      panel.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()

        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const items = listTabbable(panel)

      if (items.length === 0) {
        event.preventDefault()

        return
      }

      const active = document.activeElement
      const currentIndex =
        active instanceof HTMLElement ? items.indexOf(active) : -1
      const nextIndex = cycleTabIndex(
        currentIndex,
        items.length,
        event.shiftKey ? -1 : 1,
      )

      event.preventDefault()
      items[nextIndex]?.focus()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [panelRef])
}
