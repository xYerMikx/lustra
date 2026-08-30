import type { MasterClientView, ServiceView } from '@lumira/contracts'

import { listMasterClients } from '@/shared/api/master-clients-client'
import { listMasterServices } from '@/shared/api/master-services-client'

export type ManualBookingFormData = {
  services: ServiceView[]
  clients: MasterClientView[]
}

export async function loadManualBookingFormData(): Promise<ManualBookingFormData> {
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
