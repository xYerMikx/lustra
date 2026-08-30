import type { OnboardingStep } from '@lumira/contracts'

export const ONBOARDING_STEPS = [
  { id: 'profile', label: 'Профиль' },
  { id: 'services', label: 'Услуги' },
  { id: 'schedule', label: 'График' },
  { id: 'portfolio', label: 'Портфолио' },
] as const

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id']

export function wizardStepFromOnboarding(
  step: OnboardingStep | null,
): OnboardingStepId {
  if (step === 'services' || step === 'schedule') {
    return step
  }

  if (step === 'portfolio' || step === 'done') {
    return 'portfolio'
  }

  return 'profile'
}

export function stepStatus(
  stepId: OnboardingStepId,
  currentStepId: OnboardingStepId,
): 'done' | 'active' | 'pending' {
  const stepIndex = ONBOARDING_STEPS.findIndex((step) => step.id === stepId)
  const currentIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStepId,
  )

  if (stepIndex < currentIndex) {
    return 'done'
  }

  if (stepIndex === currentIndex) {
    return 'active'
  }

  return 'pending'
}
