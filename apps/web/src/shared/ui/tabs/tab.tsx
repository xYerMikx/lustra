'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import cn from 'classnames'

import { useTabs } from '@/shared/ui/tabs/tabs-context'
import styles from '@/shared/ui/tabs/tabs.module.css'

type TabProps = {
  value: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'role' | 'children'>

export function Tab({ value, children, className, onClick, ...props }: TabProps) {
  const tabs = useTabs()
  const selected = tabs.value === value

  return (
    <button
      {...props}
      type="button"
      role="tab"
      data-value={value}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={cn(styles.tab, className)}
      onClick={(event) => {
        onClick?.(event)

        if (event.defaultPrevented) {
          return
        }

        tabs.onChange(value)
      }}
    >
      {children}
    </button>
  )
}
