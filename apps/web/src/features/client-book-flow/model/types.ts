import type { RecommendedMasterRef } from '@lumira/contracts'

export type ClientBookStep = 'service' | 'master' | 'slot'

export type ClientBookServiceSource = 'recommended' | 'past' | 'catalog'

export type ClientBookServiceOption = {
  key: string
  title: string
  categorySlug: string | null
  serviceId: string | null
  source: ClientBookServiceSource
  lastMaster: RecommendedMasterRef | null
  lastMasterId: string | null
}

export type BookMasterSource = 'last' | 'favorite' | 'catalog'

export type BookMasterCandidate = {
  id: string
  slug: string
  displayName: string
  headline: string | null
  districtName: string | null
  ratingAvg: number
  ratingCount: number
  priceFrom: number | null
  specialty: string | null
  source: BookMasterSource
}
