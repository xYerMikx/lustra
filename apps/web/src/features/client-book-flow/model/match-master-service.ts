import type { PublicServiceView } from '@lustra/contracts'

import { normalizeServiceTitle } from '@/features/client-book-flow/model/normalize-service-title'

export function matchMasterService(
  services: PublicServiceView[],
  selected: { serviceId: string | null; title: string },
): PublicServiceView | null {
  if (selected.serviceId) {
    const byId = services.find((item) => item.id === selected.serviceId)

    if (byId) {
      return byId
    }
  }

  const title = normalizeServiceTitle(selected.title)

  return (
    services.find((item) => normalizeServiceTitle(item.title) === title) ?? null
  )
}

export function orderServicesForPicker(
  services: PublicServiceView[],
  selected: { serviceId: string | null; title: string } | null,
): PublicServiceView[] {
  if (!selected) {
    return services
  }

  const match = matchMasterService(services, selected)

  if (!match) {
    return services
  }

  return [match, ...services.filter((item) => item.id !== match.id)]
}
