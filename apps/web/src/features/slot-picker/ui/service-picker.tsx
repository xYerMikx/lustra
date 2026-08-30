'use client'

import type { PublicServiceView } from '@lumira/contracts'
import cn from 'classnames'

import styles from '@/features/slot-picker/ui/slot-picker.module.css'
import { formatPriceLabel } from '@/shared/lib/money'
import { serviceOptionTestId } from '@/shared/lib/test-id'

type ServicePickerProps = {
  services: PublicServiceView[]
  selectedServiceId: string | null
  onSelect: (serviceId: string) => void
}

export function ServicePicker({
  services,
  selectedServiceId,
  onSelect,
}: ServicePickerProps) {
  return (
    <div className={styles.serviceList} role="listbox" aria-label="Услуги">
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          role="option"
          aria-selected={service.id === selectedServiceId}
          className={cn(
            styles.serviceButton,
            service.id === selectedServiceId && styles.serviceButtonActive,
          )}
          onClick={() => onSelect(service.id)}
          data-testid={serviceOptionTestId(service.id)}
        >
          <span>
            <span className={styles.serviceTitle}>{service.title}</span>
            <span className={styles.serviceMeta}>
              {' '}
              · {service.durationMin} мин
            </span>
          </span>
          <span className={styles.serviceMeta}>
            {formatPriceLabel(service)}
          </span>
        </button>
      ))}
    </div>
  )
}
