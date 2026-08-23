import { describe, expect, it } from 'vitest'

import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path'

const clientUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'client.smoke.1@example.com',
  firstName: 'Anna',
  lastName: null,
  role: 'client' as const,
  emailVerified: false,
  telegramLinked: false,
  profileStatus: null,
  onboardingStep: null,
}

const draftMaster = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'master.smoke.1@example.com',
  firstName: 'Masha',
  lastName: null,
  role: 'master' as const,
  emailVerified: false,
  telegramLinked: false,
  profileStatus: 'draft' as const,
  onboardingStep: 'profile' as const,
}

describe('resolvePostAuthPath', () => {
  it('prefers a safe next path', () => {
    expect(resolvePostAuthPath(clientUser, '/m/anna#booking')).toBe(
      '/m/anna#booking',
    )
  })

  it('rejects open redirects', () => {
    expect(resolvePostAuthPath(clientUser, '//evil.example')).toBe('/app')
  })

  it('sends draft masters to onboarding', () => {
    expect(resolvePostAuthPath(draftMaster)).toBe('/app/onboarding')
  })

  it('sends finished draft masters to the cabinet', () => {
    expect(
      resolvePostAuthPath({ ...draftMaster, onboardingStep: 'done' }),
    ).toBe('/app')
  })

  it('sends admins to admin queue', () => {
    expect(
      resolvePostAuthPath({
        ...clientUser,
        id: '33333333-3333-3333-3333-333333333333',
        email: 'admin.smoke.1@example.com',
        role: 'admin',
      }),
    ).toBe('/admin')
  })
})
