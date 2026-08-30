import type {
  DistrictView,
  MasterProfileView,
  StepBasicsInput,
} from '@lumira/contracts'

import { readStepBasicsDraft } from '@/features/master-onboarding/model/step-basics-draft'

export function buildStepBasicsDefaultValues(
  profile: MasterProfileView,
  userFirstName: string,
  districts: DistrictView[],
): StepBasicsInput {
  const stored = readStepBasicsDraft()

  if (stored) {
    return {
      displayName: stored.displayName,
      districtId: stored.districtId || districts[0]?.id || '',
      locationType: stored.locationType,
      headline: stored.headline,
    }
  }

  return {
    displayName: profile.displayName || userFirstName,
    districtId: profile.primaryLocation?.districtId ?? districts[0]?.id ?? '',
    locationType: profile.primaryLocation?.type ?? 'salon',
    headline: profile.headline ?? '',
  }
}
