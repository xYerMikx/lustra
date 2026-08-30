import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import type { MasterClientView } from '@lumira/contracts'

import { applySuggestKey } from '@/features/manual-booking/model/apply-suggest-key'
import { filterMasterClients } from '@/features/manual-booking/model/filter-master-clients'
import { isEventInside } from '@/features/manual-booking/model/is-event-inside'

type UseClientSuggestInput = {
  value: string
  clients: MasterClientView[]
  onChange: (name: string) => void
  onPick: (client: MasterClientView) => void
}

export function useClientSuggest({
  value,
  clients,
  onChange,
  onPick,
}: UseClientSuggestInput) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const matches = filterMasterClients(value, clients)
  const showList = open && matches.length > 0

  useEffect(() => {
    if (!open) {
      return
    }

    const closeIfOutside = (event: MouseEvent) => {
      if (!isEventInside(rootRef.current, event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeIfOutside)

    return () => {
      document.removeEventListener('mousedown', closeIfOutside)
    }
  }, [open])

  const handleChange = (next: string) => {
    onChange(next)
    setActiveIndex(0)
    setOpen(true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const next = applySuggestKey({
      key: event.key,
      open,
      activeIndex,
      matchCount: matches.length,
    })

    if (next.preventDefault) {
      event.preventDefault()
    }

    setOpen(next.open)
    setActiveIndex(next.activeIndex)

    if (!next.pick) {
      return
    }

    const match = matches[next.activeIndex]

    if (match) {
      onPick(match)
    }
  }

  const pickClient = (client: MasterClientView) => {
    onPick(client)
    setOpen(false)
  }

  return {
    rootRef,
    matches,
    showList,
    activeIndex,
    setActiveIndex,
    openList: () => setOpen(true),
    handleChange,
    handleKeyDown,
    pickClient,
  }
}
