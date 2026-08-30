'use client'

import cn from 'classnames'
import type { MasterClientView } from '@lumira/contracts'

import { clientSuggestMeta } from '@/features/manual-booking/model/client-suggest-meta'
import { useClientSuggest } from '@/features/manual-booking/model/use-client-suggest'
import styles from '@/features/manual-booking/ui/manual-booking.module.css'

type ClientSuggestProps = {
  id: string
  value: string
  clients: MasterClientView[]
  onChange: (name: string) => void
  onPick: (client: MasterClientView) => void
  testId?: string
}

export function ClientSuggest({
  id,
  value,
  clients,
  onChange,
  onPick,
  testId,
}: ClientSuggestProps) {
  const suggest = useClientSuggest({ value, clients, onChange, onPick })

  return (
    <div className={styles.suggestRoot} ref={suggest.rootRef}>
      <input
        id={id}
        className={styles.input}
        autoComplete="off"
        required
        role="combobox"
        aria-expanded={suggest.showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        value={value}
        data-testid={testId}
        onFocus={suggest.openList}
        onChange={(event) => suggest.handleChange(event.target.value)}
        onKeyDown={suggest.handleKeyDown}
      />
      {suggest.showList ? (
        <ul id={`${id}-list`} className={styles.suggestList} role="listbox">
          {suggest.matches.map((client, index) => {
            const meta = clientSuggestMeta(client)

            return (
              <li key={client.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={index === suggest.activeIndex}
                  className={cn(
                    styles.suggestOption,
                    index === suggest.activeIndex && styles.suggestOptionActive,
                  )}
                  onMouseEnter={() => suggest.setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => suggest.pickClient(client)}
                >
                  <span className={styles.suggestName}>{client.name}</span>
                  {meta ? (
                    <span className={styles.suggestPhone}>{meta}</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
