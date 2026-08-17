import type { LocationType } from '@lustra/db'

import type { MasterProfileRecord } from '@/modules/master-profile/domain/map-master-profile'

export type ProfileUpdateData = {
  displayName?: string
  headline?: string | null
  bio?: string | null
  slug?: string
  status?: 'draft' | 'pending_review' | 'published' | 'hidden' | 'banned'
}

export type ContactUpdateData = {
  publicPhone?: string | null
  instagram?: string | null
  telegramUsername?: string | null
  website?: string | null
}

export type PrimaryLocationInput = {
  districtId: string
  type: LocationType
  addressHint?: string | null
}

export type MasterProfileStore = {
  findByUserId(userId: string): Promise<MasterProfileRecord | null>
  isSlugTaken(slug: string, excludeMasterId?: string): Promise<boolean>
  updateProfile(
    masterId: string,
    data: ProfileUpdateData,
  ): Promise<MasterProfileRecord>
  upsertPrimaryLocation(
    masterId: string,
    input: PrimaryLocationInput,
  ): Promise<MasterProfileRecord>
  upsertContact(
    masterId: string,
    data: ContactUpdateData,
  ): Promise<MasterProfileRecord>
}

export type DistrictListItem = {
  id: string
  name: string
  slug: string
  city: string
}

export type DistrictStore = {
  listAll(): Promise<DistrictListItem[]>
  findById(id: string): Promise<{ id: string } | null>
}

export type EmailVerificationReader = {
  isEmailVerified(userId: string): Promise<boolean>
}
