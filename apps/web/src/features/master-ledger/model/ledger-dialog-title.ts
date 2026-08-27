import type { LedgerComposerIntent } from '@/features/master-ledger/model/parse-ledger-intent'

export function ledgerDialogTitle(
  intent: LedgerComposerIntent,
  bookingId?: string,
): string {
  if (intent === 'tip' && bookingId) {
    return 'Чаевые к визиту'
  }

  if (intent === 'tip') {
    return 'Чаевые'
  }

  return 'Расход'
}
