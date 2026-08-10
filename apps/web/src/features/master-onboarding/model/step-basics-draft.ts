import type { LocationType } from '@lustra/contracts'

export const ONBOARDING_STEP1_STORAGE_KEY = 'lustra:onboarding:step1'

export type StepBasicsDraft = {
  displayName: string
  districtId: string
  locationType: LocationType
  headline: string
}

export const LOCATION_TYPE_OPTIONS: Array<{
  value: LocationType
  label: string
}> = [
  { value: 'salon', label: 'Салон / кабинет' },
  { value: 'home_studio', label: 'Домашняя студия' },
  { value: 'client_home', label: 'Выезд к клиенту' },
]

export function readStepBasicsDraft(): StepBasicsDraft | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STEP1_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StepBasicsDraft

    if (!parsed.displayName || !parsed.districtId || !parsed.locationType) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writeStepBasicsDraft(draft: StepBasicsDraft): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ONBOARDING_STEP1_STORAGE_KEY, JSON.stringify(draft))
}
