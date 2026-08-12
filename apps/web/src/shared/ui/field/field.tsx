import type { ReactNode } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/field/field.module.css'

type FieldProps = {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  )
}
