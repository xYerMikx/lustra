'use client'

import type { PublicMasterView } from '@lustra/contracts'

import { orderServicesForPicker } from '@/features/client-book-flow/model/match-master-service'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { SlotPicker } from '@/features/slot-picker'
import { TEST_ID } from '@/shared/lib/test-id'

type SlotStepProps = {
  master: PublicMasterView
  service: ClientBookServiceOption | null
}

export function SlotStep({ master, service }: SlotStepProps) {
  const services = orderServicesForPicker(
    master.services,
    service
      ? { serviceId: service.serviceId, title: service.title }
      : null,
  )

  return (
    <div data-testid={TEST_ID.clientBookSlotStep}>
      <p className={styles.copy}>
        {master.displayName}
        {service ? ` · ${service.title}` : ''}
      </p>
      <SlotPicker
        key={master.id}
        masterId={master.id}
        masterSlug={master.slug}
        services={services}
      />
    </div>
  )
}
