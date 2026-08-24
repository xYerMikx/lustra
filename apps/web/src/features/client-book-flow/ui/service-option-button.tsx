'use client'

import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { bookServiceOptionTestId } from '@/shared/lib/test-id'

const SOURCE_LABEL: Record<ClientBookServiceOption['source'], string> = {
  recommended: 'Рекомендуем',
  past: 'Ранее',
  catalog: 'Каталог',
}

type ServiceOptionButtonProps = {
  option: ClientBookServiceOption
  onSelect: (option: ClientBookServiceOption) => void
}

export function ServiceOptionButton({
  option,
  onSelect,
}: ServiceOptionButtonProps) {
  return (
    <button
      type="button"
      className={styles.option}
      onClick={() => onSelect(option)}
      data-testid={bookServiceOptionTestId(option.key)}
    >
      <span className={styles.optionTitle}>{option.title}</span>
      <span className={styles.optionMeta}>{SOURCE_LABEL[option.source]}</span>
    </button>
  )
}
