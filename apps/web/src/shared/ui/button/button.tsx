import type { ButtonHTMLAttributes, ReactNode } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/button/button.module.css'
import { Spinner } from '@/shared/ui/spinner'

export type ButtonVariant = 'primary' | 'ghost' | 'icon'
export type ButtonLoadingPlacement = 'replace' | 'left' | 'right'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  fullWidth?: boolean
  leftAddon?: ReactNode
  rightAddon?: ReactNode
  loading?: boolean
  loadingPlacement?: ButtonLoadingPlacement
  children: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  leftAddon,
  rightAddon,
  loading = false,
  loadingPlacement = 'replace',
  className,
  type = 'button',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading)
  const left =
    loading && loadingPlacement === 'left' ? <Spinner /> : leftAddon
  const right =
    loading && loadingPlacement === 'right' ? <Spinner /> : rightAddon
  const replaceContent = loading && loadingPlacement === 'replace'

  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], fullWidth && styles.fullWidth, className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {replaceContent ? (
        <>
          <Spinner />
          <span className={styles.loadingLabel}>{children}</span>
        </>
      ) : (
        <>
          {left ? <span className={styles.addon}>{left}</span> : null}
          {children}
          {right ? <span className={styles.addon}>{right}</span> : null}
        </>
      )}
    </button>
  )
}
