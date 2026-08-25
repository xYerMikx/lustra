'use client'

import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'
import { ServiceOptionButton } from '@/features/client-book-flow/ui/service-option-button'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'

type ServiceOptionGroupProps = {
  title: string
  options: ClientBookServiceOption[]
  onSelect: (option: ClientBookServiceOption) => void
}

export function ServiceOptionGroup({
  title,
  options,
  onSelect,
}: ServiceOptionGroupProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <ul className={styles.optionList}>
        {options.map((option) => (
          <li key={option.key}>
            <ServiceOptionButton option={option} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  )
}
