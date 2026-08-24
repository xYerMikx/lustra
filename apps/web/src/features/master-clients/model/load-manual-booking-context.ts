import type { MasterClientView, ServiceView } from '@lustra/contracts'

import { listMasterClients } from '@/shared/api/master-clients-client'
import { listMasterServices } from '@/shared/api/master-services-client'

export async function loadManualBookingContext(): Promise<{
  services: ServiceView[]
  clients: MasterClientView[]
}> {
  const [servicesResponse, clientsResponse] = await Promise.all([
    listMasterServices(),
    listMasterClients(),
  ])

  const services = (servicesResponse?.services ?? []).filter(
    (service) => service.isActive,
  )
  const clients: MasterClientView[] = clientsResponse?.items ?? []

  return { services, clients }
}
