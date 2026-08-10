import { DomainError } from '@/common/errors/domain-error'

export function assertDurationStep(durationMin: number): void {
  if (durationMin <= 0 || durationMin % 15 !== 0) {
    throw new DomainError('VALIDATION_FAILED', 'Длительность должна быть кратна 15 минутам', {
      fieldErrors: {
        durationMin: ['Длительность должна быть кратна 15 минутам'],
      },
    })
  }
}
