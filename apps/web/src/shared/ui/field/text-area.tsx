import type { TextareaHTMLAttributes } from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/field/field.module.css'

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
}

export function TextArea({
  className,
  invalid = false,
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      className={cn(
        styles.control,
        styles.controlMultiline,
        invalid && styles.controlInvalid,
        className,
      )}
      rows={rows}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
}
