import type { RegisterRole } from '@lustra/contracts'

import styles from '@/features/auth/ui/auth-form.module.css'

type RoleSegmentProps = {
  value: RegisterRole
  onChange: (role: RegisterRole) => void
}

const OPTIONS: { value: RegisterRole; label: string }[] = [
  { value: 'client', label: 'Клиент' },
  { value: 'master', label: 'Мастер' },
]

export function RoleSegment({ value, onChange }: RoleSegmentProps) {
  return (
    <div className={styles.roleSegment} role="group" aria-label="Я регистрируюсь как">
      {OPTIONS.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            className={styles.roleSegmentOption}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
