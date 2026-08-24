import type {
  RecommendedServiceView,
  ServiceTemplateView,
} from '@lustra/contracts'

import { normalizeServiceTitle } from '@/features/client-book-flow/model/normalize-service-title'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'

export type PastBookingServiceRef = {
  serviceId: string | null
  serviceTitle: string
  masterId: string
}

export function serviceOptionKey(
  source: ClientBookServiceOption['source'],
  title: string,
  serviceId: string | null,
): string {
  if (serviceId) {
    return `${source}:${serviceId}`
  }

  return `${source}:${normalizeServiceTitle(title)}`
}

export function buildServiceOptions(input: {
  recommendations: RecommendedServiceView[]
  pastBookings: PastBookingServiceRef[]
  templates: ServiceTemplateView[]
}): ClientBookServiceOption[] {
  const seen = new Set<string>()
  const options: ClientBookServiceOption[] = []

  const push = (option: ClientBookServiceOption) => {
    const dedupe = normalizeServiceTitle(option.title)

    if (!dedupe || seen.has(dedupe)) {
      return
    }

    seen.add(dedupe)
    options.push(option)
  }

  for (const rec of input.recommendations) {
    push({
      key: serviceOptionKey('recommended', rec.serviceTitle, rec.serviceId),
      title: rec.serviceTitle,
      categorySlug: null,
      serviceId: rec.serviceId,
      source: 'recommended',
      lastMaster: rec.lastMaster,
      lastMasterId: rec.lastMaster?.id ?? null,
    })
  }

  for (const booking of input.pastBookings) {
    push({
      key: serviceOptionKey('past', booking.serviceTitle, booking.serviceId),
      title: booking.serviceTitle,
      categorySlug: null,
      serviceId: booking.serviceId,
      source: 'past',
      lastMaster: null,
      lastMasterId: booking.masterId,
    })
  }

  for (const template of input.templates) {
    push({
      key: serviceOptionKey('catalog', template.title, null),
      title: template.title,
      categorySlug: template.categorySlug,
      serviceId: null,
      source: 'catalog',
      lastMaster: null,
      lastMasterId: null,
    })
  }

  return options
}
