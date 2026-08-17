import type { DistrictView, MasterProfileView } from '@lustra/contracts'

import type { EditMasterProfileFormValues } from '@/features/master-profile-edit/model/edit-profile-form-schema'

export function buildEditProfileDefaults(
  profile: MasterProfileView,
  districts: DistrictView[],
): EditMasterProfileFormValues {
  const districtId =
    profile.primaryLocation?.districtId ?? districts[0]?.id ?? ''

  return {
    displayName: profile.displayName,
    slug: profile.slug,
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    districtId,
    locationType: profile.primaryLocation?.type ?? 'salon',
    addressHint: profile.primaryLocation?.addressHint ?? '',
  }
}
