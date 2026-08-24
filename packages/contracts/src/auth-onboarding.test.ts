import { describe, expect, it } from 'vitest'

import { resolveOnboardingStep } from './auth'

describe('resolveOnboardingStep', () => {
  it('starts at profile until a location is saved', () => {
    expect(
      resolveOnboardingStep({
        hasLocation: false,
        hasService: false,
        hasSchedule: false,
      }),
    ).toBe('profile')
  })

  it('advances to services after the district is set', () => {
    expect(
      resolveOnboardingStep({
        hasLocation: true,
        hasService: false,
        hasSchedule: false,
      }),
    ).toBe('services')
  })

  it('advances to schedule after the first service', () => {
    expect(
      resolveOnboardingStep({
        hasLocation: true,
        hasService: true,
        hasSchedule: false,
      }),
    ).toBe('schedule')
  })

  it('marks the wizard done after a weekly schedule (portfolio is optional)', () => {
    expect(
      resolveOnboardingStep({
        hasLocation: true,
        hasService: true,
        hasSchedule: true,
      }),
    ).toBe('done')
  })
})
