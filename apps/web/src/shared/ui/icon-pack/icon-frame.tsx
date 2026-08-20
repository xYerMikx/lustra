import type { ReactNode } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/icon-pack/icon.module.css'

export type IconProps = {
  className?: string
  title?: string
}

type IconFrameProps = IconProps & {
  children: ReactNode
}

export function IconFrame({ className, title, children }: IconFrameProps) {
  return (
    <svg
      className={cn(styles.icon, className)}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {children}
    </svg>
  )
}
