import type { InputHTMLAttributes } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/field/field.module.css'

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export function TextInput({
  className,
  invalid = false,
  ...props
}: TextInputProps) {
  return (
    <input
      className={cn(
        styles.control,
        invalid && styles.controlInvalid,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
