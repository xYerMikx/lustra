import type { ReactNode } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/field/field.module.css'

type FieldProps = {
  label: string
  htmlFor?: string
  error?: string
  errorTestId?: string
  children: ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  error,
  errorTestId,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <span className={styles.error} data-testid={errorTestId}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
