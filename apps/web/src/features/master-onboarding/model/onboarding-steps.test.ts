import { describe, expect, it } from 'vitest'

import { wizardStepFromOnboarding } from '@/features/master-onboarding/model/onboarding-steps'

describe('wizardStepFromOnboarding', () => {
  it('opens the first incomplete step', () => {
    expect(wizardStepFromOnboarding('profile')).toBe('profile')
    expect(wizardStepFromOnboarding('services')).toBe('services')
    expect(wizardStepFromOnboarding('schedule')).toBe('schedule')
  })

  it('opens portfolio when the required steps are already done', () => {
    expect(wizardStepFromOnboarding('portfolio')).toBe('portfolio')
    expect(wizardStepFromOnboarding('done')).toBe('portfolio')
  })
})
