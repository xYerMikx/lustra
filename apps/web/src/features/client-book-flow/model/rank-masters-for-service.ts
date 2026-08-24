import type { CatalogMasterCard } from '@lustra/contracts'

import { normalizeServiceTitle } from '@/features/client-book-flow/model/normalize-service-title'
import type {
  BookMasterCandidate,
  ClientBookServiceOption,
} from '@/features/client-book-flow/model/types'

function toCandidate(
  card: CatalogMasterCard,
  source: BookMasterCandidate['source'],
): BookMasterCandidate {
  return {
    id: card.id,
    slug: card.slug,
    displayName: card.displayName,
    headline: card.headline,
    districtName: card.districtName,
    ratingAvg: card.ratingAvg,
    ratingCount: card.ratingCount,
    priceFrom: card.priceFrom,
    specialty: card.specialty,
    source,
  }
}

function offersSelectedService(
  card: CatalogMasterCard,
  title: string,
): boolean {
  if (!card.specialty) {
    return true
  }

  return normalizeServiceTitle(card.specialty) === normalizeServiceTitle(title)
}

export function rankMastersForService(input: {
  service: ClientBookServiceOption
  favorites: CatalogMasterCard[]
  catalog: CatalogMasterCard[]
}): BookMasterCandidate[] {
  const result: BookMasterCandidate[] = []
  const seen = new Set<string>()

  const add = (candidate: BookMasterCandidate) => {
    if (seen.has(candidate.id)) {
      return
    }

    seen.add(candidate.id)
    result.push(candidate)
  }

  const lastFromLists =
    input.catalog.find((item) => item.id === input.service.lastMasterId) ??
    input.favorites.find((item) => item.id === input.service.lastMasterId) ??
    null

  if (lastFromLists) {
    add(toCandidate(lastFromLists, 'last'))
  } else if (input.service.lastMaster) {
    const last = input.service.lastMaster

    add({
      id: last.id,
      slug: last.slug,
      displayName: last.displayName,
      headline: null,
      districtName: null,
      ratingAvg: 0,
      ratingCount: 0,
      priceFrom: null,
      specialty: input.service.title,
      source: 'last',
    })
  }

  for (const favorite of input.favorites) {
    if (offersSelectedService(favorite, input.service.title)) {
      add(toCandidate(favorite, 'favorite'))
    }
  }

  for (const card of input.catalog) {
    add(toCandidate(card, 'catalog'))
  }

  return result
}
