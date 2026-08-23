'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type {
  LedgerCategoryView,
  LedgerEntryView,
  LedgerKind,
  LedgerListResponse,
  LedgerPeriodPreset,
} from '@lustra/contracts'

import { ledgerRangeForPreset } from '@/features/master-ledger/model/ledger-range'
import {
  createLedgerCategory,
  createLedgerEntry,
  deleteLedgerEntry,
  listMasterLedger,
} from '@/shared/api/ledger-client'
import { ApiError } from '@/shared/api/http'

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
    setStatus('loading')
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
        error instanceof ApiError ? error.message : 'Не удалось загрузить кассу',
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

  const addEntry = async (input: {
    kind: LedgerKind
    categoryId: string
    amount: string
    note?: string
    periodStart?: string
    periodEnd?: string
  }) => {
    await createLedgerEntry({
      ...input,
      occurredOn: input.kind === 'expense' ? input.periodEnd ?? to : to,
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
    data,
    status,
    errorMessage,
    setPreset,
    setKind: (value?: LedgerKind) => replaceQuery({ kind: value }),
    setCategoryId: (value?: string) => replaceQuery({ categoryId: value }),
    addEntry,
    addCategory,
    removeEntry,
    reload,
  }
}
