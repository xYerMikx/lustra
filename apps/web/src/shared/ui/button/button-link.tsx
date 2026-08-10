import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/button/button.module.css'
import type { ButtonVariant } from '@/shared/ui/button/button'

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: ButtonVariant
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(styles.button, styles[variant], fullWidth && styles.fullWidth, className)}
      {...props}
    >
      {children}
    </Link>
  )
}
