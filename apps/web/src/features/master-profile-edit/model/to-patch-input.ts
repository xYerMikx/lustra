import type { PatchMasterProfileInput } from '@lustra/contracts'

import type {
  EditMasterProfileFormValues,
} from '@/features/master-profile-edit/model/edit-profile-form-schema'

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return null
  }

  return trimmed
}

export function toPatchMasterProfileInput(
  values: EditMasterProfileFormValues,
): PatchMasterProfileInput {
  return {
    displayName: values.displayName,
    slug: values.slug,
    headline: emptyToNull(values.headline),
    bio: emptyToNull(values.bio),
    districtId: values.districtId,
    locationType: values.locationType,
    addressHint: emptyToNull(values.addressHint),
    publicPhone: emptyToNull(values.publicPhone),
    instagram: emptyToNull(values.instagram),
    telegramUsername: emptyToNull(values.telegramUsername),
    website: emptyToNull(values.website),
  }
}
