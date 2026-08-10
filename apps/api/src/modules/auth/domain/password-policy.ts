import { DomainError } from '../../../common/errors/domain-error'

const MIN_PASSWORD_LENGTH = 8

export function assertPasswordPolicy(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new DomainError('VALIDATION_FAILED', 'Пароль не короче 8 символов', {
      fieldErrors: { password: ['Пароль не короче 8 символов'] },
    })
  }
}
