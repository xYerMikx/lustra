export const ONBOARDING_STEPS = [
  { id: 'profile', label: 'Профиль' },
  { id: 'services', label: 'Услуги' },
  { id: 'schedule', label: 'График' },
  { id: 'portfolio', label: 'Портфолио' },
] as const

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]['id']

export const CURRENT_ONBOARDING_STEP: OnboardingStepId = 'profile'
