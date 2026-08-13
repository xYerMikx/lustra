import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'

export function assertAdmin(currentUser: AuthUser): void {
  if (currentUser.role !== 'admin') {
    throw new DomainError('FORBIDDEN', 'Недостаточно прав')
  }
}
