import type { ButtonHTMLAttributes, ReactNode } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/button/button.module.css'

export type ButtonVariant = 'primary' | 'ghost' | 'icon'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], fullWidth && styles.fullWidth, className)}
      {...props}
    >
      {children}
    </button>
  )
}
