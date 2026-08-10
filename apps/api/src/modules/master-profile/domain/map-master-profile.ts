import type {
  MasterLocationView,
  MasterProfileView,
} from '@lustra/contracts'
import type { MasterProfile, MasterLocation, District } from '@lustra/db'

export type MasterProfileRecord = MasterProfile & {
  locations: Array<
    MasterLocation & {
      district: Pick<District, 'id' | 'name' | 'slug' | 'city'>
    }
  >
}

export function toMasterProfileView(record: MasterProfileRecord): MasterProfileView {
  const primary =
    record.locations.find((location) => location.isPrimary) ??
    record.locations[0] ??
    null

  return {
    id: record.id,
    slug: record.slug,
    displayName: record.displayName,
    headline: record.headline,
    bio: record.bio,
    status: record.status,
    experienceSince: record.experienceSince,
    languages: parseLanguages(record.languages),
    primaryLocation: primary ? toLocationView(primary) : null,
  }
}

function toLocationView(
  location: MasterLocation & {
    district: Pick<District, 'id' | 'name' | 'slug' | 'city'>
  },
): MasterLocationView {
  return {
    id: location.id,
    districtId: location.districtId,
    districtName: location.district.name,
    districtSlug: location.district.slug,
    type: location.type,
    addressHint: location.addressHint,
    isPrimary: location.isPrimary,
  }
}

function parseLanguages(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const languages = value.filter((item): item is string => typeof item === 'string')
  return languages.length > 0 ? languages : null
}
