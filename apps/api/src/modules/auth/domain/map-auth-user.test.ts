import { describe, expect, it } from 'vitest'

import { toAuthUserView } from '@/modules/auth/domain/map-auth-user'

const baseUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'master@example.com',
  firstName: 'Настя',
  lastName: null,
  role: 'master' as const,
  emailVerified: true,
  telegram: null,
}

describe('toAuthUserView', () => {
  it('hides onboarding after location, service and schedule exist', () => {
    const view = toAuthUserView({
      ...baseUser,
      masterProfile: {
        status: 'draft',
        locations: [{ id: 'loc' }],
        services: [{ id: 'svc' }],
        rules: [{ id: 'rule' }],
      },
    })

    expect(view.onboardingStep).toBe('done')
    expect(view.profileStatus).toBe('draft')
  })

  it('resumes at the first incomplete wizard step', () => {
    expect(
      toAuthUserView({
        ...baseUser,
        masterProfile: {
          status: 'draft',
          locations: [{ id: 'loc' }],
          services: [],
          rules: [],
        },
      }).onboardingStep,
    ).toBe('services')
  })

  it('leaves onboarding empty for clients', () => {
    const view = toAuthUserView({
      ...baseUser,
      role: 'client',
      masterProfile: null,
    })

    expect(view.onboardingStep).toBeNull()
  })
})
