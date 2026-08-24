import type { AuthUserView } from '@lustra/contracts'

function isSafeNextPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//')
}

export function resolvePostAuthPath(
  user: AuthUserView,
  nextPath?: string | null,
): string {
  if (nextPath && isSafeNextPath(nextPath)) {
    return nextPath
  }

  if (user.role === 'master' && user.profileStatus === 'draft') {
    if (user.onboardingStep === 'done') {
      return '/app'
    }

    return '/app/onboarding'
  }

  if (user.role === 'admin') {
    return '/admin'
  }

  return '/app'
}
