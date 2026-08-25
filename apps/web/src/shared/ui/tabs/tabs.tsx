'use client'

import type { KeyboardEvent, ReactNode } from 'react'

import { collectTabValues } from '@/shared/ui/tabs/collect-tab-values'
import { TabsContext } from '@/shared/ui/tabs/tabs-context'
import styles from '@/shared/ui/tabs/tabs.module.css'

type TabsProps = {
  value: string
  onChange: (value: string) => void
  'aria-label': string
  children: ReactNode
}

export function Tabs({
  value,
  onChange,
  children,
  'aria-label': ariaLabel,
}: TabsProps) {
  const values = collectTabValues(children)
  const selectedIndex = Math.max(0, values.indexOf(value))
  const count = Math.max(1, values.length)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return
    }

    event.preventDefault()

    const delta = event.key === 'ArrowRight' ? 1 : -1
    const next = values[(selectedIndex + delta + values.length) % values.length]

    if (!next) {
      return
    }

    onChange(next)

    const nextTab = event.currentTarget.querySelector(
      `[role="tab"][data-value="${next}"]`,
    )

    if (nextTab instanceof HTMLElement) {
      nextTab.focus()
    }
  }

  return (
    <div
      className={styles.root}
      data-count={String(count)}
      data-index={String(selectedIndex)}
    >
      <span className={styles.thumb} aria-hidden="true" />
      <div
        className={styles.list}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        <TabsContext.Provider value={{ value, onChange }}>
          {children}
        </TabsContext.Provider>
      </div>
    </div>
  )
}
