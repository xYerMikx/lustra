'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type {
  CreateLedgerEntryInput,
  LedgerCategoryView,
  LedgerEntryView,
  LedgerKind,
  LedgerListResponse,
  LedgerPeriodPreset,
} from '@lumira/contracts'

import { ledgerRangeForPreset } from '@/features/master-ledger/model/ledger-range'
import { parseLedgerIntent } from '@/features/master-ledger/model/parse-ledger-intent'
import {
  createLedgerCategory,
  createLedgerEntry,
  deleteLedgerEntry,
  listMasterLedger,
} from '@/shared/api/ledger-client'
import { ApiError } from '@/shared/api/http'
import { formatYmdDateInTimeZone } from '@/shared/lib/tz'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useMasterLedger() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [data, setData] = useState<LedgerListResponse | null>(null)
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const defaultRange = useMemo(
    () => ledgerRangeForPreset('month', new Date()),
    [],
  )
  const from = searchParams.get('from') ?? defaultRange.from
  const to = searchParams.get('to') ?? defaultRange.to
  const kind = (searchParams.get('kind') as LedgerKind | null) ?? undefined
  const categoryId = searchParams.get('categoryId') ?? undefined
  const intent = parseLedgerIntent(searchParams.get('intent'))
  const bookingId = searchParams.get('bookingId') ?? undefined
  const occurredOn = searchParams.get('occurredOn') ?? undefined

  const replaceQuery = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(next)) {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams],
  )

  const reload = useCallback(async () => {
    setStatus((current) => {
      if (current === 'success' || current === 'empty') {
        return current
      }

      return 'loading'
    })
    setErrorMessage(null)

    try {
      const response = await listMasterLedger({ from, to, kind, categoryId })
      const next = response ?? null
      setData(next)

      if (!next || next.items.length === 0) {
        setStatus('empty')

        return
      }

      setStatus('success')
    } catch (error) {
      setData(null)
      setStatus('error')
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Не удалось загрузить финансы',
      )
    }
  }, [categoryId, from, kind, to])

  useEffect(() => {
    void reload()
  }, [reload])

  const setPreset = (preset: LedgerPeriodPreset) => {
    const range = ledgerRangeForPreset(preset, new Date())
    replaceQuery({ from: range.from, to: range.to })
  }

  const openComposer = (nextIntent: 'tip' | 'expense') => {
    replaceQuery({ intent: nextIntent })
  }

  const closeComposer = () => {
    replaceQuery({
      intent: undefined,
      bookingId: undefined,
      occurredOn: undefined,
    })
  }

  const addEntry = async (input: CreateLedgerEntryInput) => {
    const today = formatYmdDateInTimeZone(new Date())

    await createLedgerEntry({
      ...input,
      occurredOn:
        input.kind === 'expense'
          ? input.periodEnd ?? to
          : input.occurredOn ?? occurredOn ?? today,
      bookingId: input.kind === 'income' ? input.bookingId ?? bookingId : undefined,
    })
    await reload()
  }

  const addCategory = async (name: string, categoryKind: LedgerKind) => {
    const response = await createLedgerCategory({ kind: categoryKind, name })

    await reload()

    return response.category as LedgerCategoryView
  }

  const removeEntry = async (entry: LedgerEntryView) => {
    if (entry.source !== 'manual') {
      return
    }

    await deleteLedgerEntry(entry.id)
    await reload()
  }

  return {
    from,
    to,
    kind,
    categoryId,
    intent,
    bookingId,
    occurredOn,
    data,
    status,
    errorMessage,
    setPreset,
    setKind: (value?: LedgerKind) => replaceQuery({ kind: value }),
    setCategoryId: (value?: string) => replaceQuery({ categoryId: value }),
    openComposer,
    closeComposer,
    addEntry,
    addCategory,
    removeEntry,
    reload,
  }
}
