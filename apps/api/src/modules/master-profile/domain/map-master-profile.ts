import type {
  MasterLocationView,
  MasterProfileView,
} from '@lustra/contracts'
import type { LocationType, MasterStatus } from '@lustra/db'

export type MasterLocationRecord = {
  id: string
  districtId: string
  type: LocationType
  addressHint: string | null
  isPrimary: boolean
  district: {
    id: string
    name: string
    slug: string
    city: string
  }
}

export type MasterProfileRecord = {
  id: string
  userId: string
  slug: string
  displayName: string
  headline: string | null
  bio: string | null
  status: MasterStatus
  experienceSince: number | null
  languages: unknown
  locations: MasterLocationRecord[]
  contact: MasterContactRecord | null
}

export type MasterContactRecord = {
  publicPhone: string | null
  instagram: string | null
  telegramUsername: string | null
  website: string | null
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
    contact: toContactView(record.contact),
  }
}

function toContactView(
  contact: MasterContactRecord | null,
): MasterProfileView['contact'] {
  if (!contact) {
    return null
  }

  return {
    publicPhone: contact.publicPhone,
    instagram: contact.instagram,
    telegramUsername: contact.telegramUsername,
    website: contact.website,
  }
}

function toLocationView(location: MasterLocationRecord): MasterLocationView {
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
