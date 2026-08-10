import type { AuthUserView } from '@lustra/contracts'

export function resolvePostAuthPath(user: AuthUserView): string {
  if (user.role === 'master' && user.profileStatus === 'draft') {
    return '/app/onboarding'
  }

  return '/app'
}
