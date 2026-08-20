'use client'

import { useState, type InputHTMLAttributes } from 'react'
import cn from 'classnames'

import { EyeIcon, EyeOffIcon } from '@/shared/ui/icon-pack'
import styles from '@/shared/ui/field/field.module.css'

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  invalid?: boolean
}

export function PasswordInput({
  className,
  invalid = false,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const label = visible ? 'Скрыть пароль' : 'Показать пароль'

  return (
    <div className={styles.passwordWrap}>
      <input
        className={cn(
          styles.control,
          styles.passwordControl,
          invalid && styles.controlInvalid,
          className,
        )}
        {...props}
        type={visible ? 'text' : 'password'}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className={styles.passwordToggle}
        aria-label={label}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeIcon /> : <EyeOffIcon />}
      </button>
    </div>
  )
}
