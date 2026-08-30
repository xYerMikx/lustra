import type { RegisterRole } from '@lumira/contracts'

import styles from '@/features/auth/ui/auth-form.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type RoleSegmentProps = {
  value: RegisterRole
  onChange: (role: RegisterRole) => void
}

const OPTIONS: { value: RegisterRole; label: string; testId: string }[] = [
  { value: 'client', label: 'Клиент', testId: TEST_ID.authRoleClient },
  { value: 'master', label: 'Мастер', testId: TEST_ID.authRoleMaster },
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
            data-testid={option.testId}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
