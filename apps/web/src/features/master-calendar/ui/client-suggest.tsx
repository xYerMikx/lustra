'use client'

import cn from 'classnames'
import type { MasterClientView } from '@lustra/contracts'

import { useClientSuggest } from '@/features/master-calendar/model/use-client-suggest'
import styles from '@/features/master-calendar/ui/calendar.module.css'

type ClientSuggestProps = {
  id: string
  value: string
  clients: MasterClientView[]
  onChange: (name: string) => void
  onPick: (client: MasterClientView) => void
}

export function ClientSuggest({
  id,
  value,
  clients,
  onChange,
  onPick,
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
        onFocus={suggest.openList}
        onChange={(event) => suggest.handleChange(event.target.value)}
        onKeyDown={suggest.handleKeyDown}
      />
      {suggest.showList ? (
        <ul id={`${id}-list`} className={styles.suggestList} role="listbox">
          {suggest.matches.map((client, index) => (
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
                {client.phone ? (
                  <span className={styles.suggestPhone}>{client.phone}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
