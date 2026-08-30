'use client'

import { useEffect, useState } from 'react'
import type { LedgerSummaryView } from '@lumira/contracts'

import { ledgerRangeForPreset } from '@/features/master-ledger/model/ledger-range'
import { listMasterLedger } from '@/shared/api/ledger-client'

type SnapshotStatus = 'loading' | 'error' | 'success'

export function useLedgerSnapshot() {
  const [summary, setSummary] = useState<LedgerSummaryView | null>(null)
  const [status, setStatus] = useState<SnapshotStatus>('loading')
  const range = ledgerRangeForPreset('month', new Date())

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')

      try {
        const response = await listMasterLedger({
          from: range.from,
          to: range.to,
        })

        if (cancelled) {
          return
        }

        setSummary(response?.summary ?? null)
        setStatus(response?.summary ? 'success' : 'error')
      } catch {
        if (cancelled) {
          return
        }

        setSummary(null)
        setStatus('error')
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [range.from, range.to])

  return { summary, status }
}
