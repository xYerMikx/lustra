import type {
  EditMasterProfileFormValues,
} from '@/features/master-profile-edit/model/edit-profile-form-schema'
import type { PatchMasterProfileInput } from '@lustra/contracts'

export function toPatchMasterProfileInput(
  values: EditMasterProfileFormValues,
): PatchMasterProfileInput {
  return {
    displayName: values.displayName,
    slug: values.slug,
    headline: values.headline.length > 0 ? values.headline : null,
    bio: values.bio.length > 0 ? values.bio : null,
    districtId: values.districtId,
    locationType: values.locationType,
    addressHint:
      values.addressHint.length > 0 ? values.addressHint : null,
  }
}
