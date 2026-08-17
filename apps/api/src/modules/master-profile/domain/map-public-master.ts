import type {
  PublicMasterContactView,
  PublicMasterView,
  PublicServiceView,
} from '@lustra/contracts'
import type { LocationType, MasterStatus, PriceType } from '@lustra/db'

import { publicMediaUrl } from '@/common/media/public-media-url'

export type PublicMasterLocationRecord = {
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

export type PublicMasterServiceRecord = {
  id: string
  title: string
  description: string | null
  durationMin: number
  price: { toString(): string } | number | string
  priceMax: { toString(): string } | number | string | null
  priceType: PriceType
  currency: string
  category: {
    name: string
    slug: string
  }
}

export type PublicPortfolioRecord = {
  id: string
  serviceId: string | null
  caption: string | null
  sort: number
  isCover: boolean
  media: {
    storageKey: string
    width: number
    height: number
  }
}

export type PublicMasterRecord = {
  id: string
  slug: string
  displayName: string
  headline: string | null
  bio: string | null
  status: MasterStatus
  experienceSince: number | null
  languages: unknown
  locations: PublicMasterLocationRecord[]
  services: PublicMasterServiceRecord[]
  contact: {
    publicPhone: string | null
    instagram: string | null
    telegramUsername: string | null
  } | null
  stats: {
    ratingAvg: { toString(): string } | number | string
    ratingCount: number
  } | null
  portfolio: PublicPortfolioRecord[]
}

const PRIVATE_KEYS = [
  'addressExact',
  'lat',
  'lng',
  'boostPriority',
  'trustScore',
  'masterNote',
  'noShowRate',
  'profileViews30d',
  'documentId',
  'rejectionReason',
] as const

export function toPublicMasterView(record: PublicMasterRecord): PublicMasterView {
  if (record.status !== 'pending_review' && record.status !== 'published') {
    throw new Error('Public mapper requires pending_review or published status')
  }

  const primary =
    record.locations.find((location) => location.isPrimary) ??
    record.locations[0] ??
    null

  const view: PublicMasterView = {
    id: record.id,
    slug: record.slug,
    displayName: record.displayName,
    headline: record.headline,
    bio: record.bio,
    status: record.status,
    experienceSince: record.experienceSince,
    languages: parseLanguages(record.languages),
    primaryLocation: primary
      ? {
          id: primary.id,
          districtId: primary.districtId,
          districtName: primary.district.name,
          districtSlug: primary.district.slug,
          type: primary.type,
          addressHint: primary.addressHint,
          isPrimary: primary.isPrimary,
        }
      : null,
    ratingAvg: toNumber(record.stats?.ratingAvg ?? 0),
    ratingCount: record.stats?.ratingCount ?? 0,
    contact: toContactView(record.contact),
    services: record.services.map(toPublicServiceView),
    portfolio: record.portfolio.map(toPublicPortfolioItem),
  }

  assertNoPrivateKeys(view)

  return view
}

export function assertNoPrivateKeys(view: PublicMasterView): void {
  const serialized = JSON.stringify(view)

  for (const key of PRIVATE_KEYS) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`Public master DTO leaked private key: ${key}`)
    }
  }
}

function toPublicServiceView(
  service: PublicMasterServiceRecord,
): PublicServiceView {
  return {
    id: service.id,
    categoryName: service.category.name,
    categorySlug: service.category.slug,
    title: service.title,
    description: service.description,
    durationMin: service.durationMin,
    price: toNumber(service.price),
    priceMax: service.priceMax == null ? null : toNumber(service.priceMax),
    priceType: service.priceType,
    currency: service.currency,
  }
}

function toPublicPortfolioItem(
  item: PublicPortfolioRecord,
): PublicMasterView['portfolio'][number] {
  return {
    id: item.id,
    url: publicMediaUrl(item.media.storageKey),
    width: item.media.width,
    height: item.media.height,
    caption: item.caption,
    serviceId: item.serviceId,
    sort: item.sort,
    isCover: item.isCover,
    moderation: 'approved',
  }
}

function toContactView(
  contact: PublicMasterRecord['contact'],
): PublicMasterContactView | null {
  if (!contact) {
    return null
  }

  return {
    publicPhone: contact.publicPhone,
    instagram: contact.instagram,
    telegramUsername: contact.telegramUsername,
  }
}

function parseLanguages(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const languages = value.filter((item): item is string => typeof item === 'string')

  return languages.length > 0 ? languages : null
}

function toNumber(value: { toString(): string } | number | string): number {
  if (typeof value === 'number') {
    return value
  }

  return Number(value)
}
