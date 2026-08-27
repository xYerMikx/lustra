'use client'

import type {
  CreateLedgerEntryInput,
  LedgerCategoryView,
  LedgerKind,
} from '@lustra/contracts'

import type { LedgerComposerIntent } from '@/features/master-ledger/model/parse-ledger-intent'
import { LedgerEntryForm } from '@/features/master-ledger/ui/ledger-entry-form'
import { Dialog } from '@/shared/ui/dialog'

type LedgerEntryDialogProps = {
  intent: LedgerComposerIntent
  from: string
  to: string
  occurredOn?: string
  bookingId?: string
  categories: LedgerCategoryView[]
  onClose: () => void
  onCreateEntry: (input: CreateLedgerEntryInput) => Promise<void>
  onCreateCategory: (name: string, kind: LedgerKind) => Promise<LedgerCategoryView>
}

function dialogTitle(intent: LedgerComposerIntent, bookingId?: string): string {
  if (intent === 'tip' && bookingId) {
    return 'Чаевые к визиту'
  }

  if (intent === 'tip') {
    return 'Чаевые'
  }

  return 'Расход'
}

export function LedgerEntryDialog({
  intent,
  from,
  to,
  occurredOn,
  bookingId,
  categories,
  onClose,
  onCreateEntry,
  onCreateCategory,
}: LedgerEntryDialogProps) {
  const submit = async (input: CreateLedgerEntryInput) => {
    await onCreateEntry(input)
    onClose()
  }

  return (
    <Dialog
      title={dialogTitle(intent, bookingId)}
      titleId="ledger-entry-dialog-title"
      onClose={onClose}
    >
      <LedgerEntryForm
        key={`${intent}-${bookingId ?? ''}`}
        intent={intent}
        from={from}
        to={to}
        occurredOn={occurredOn}
        bookingId={bookingId}
        categories={categories}
        onCreateEntry={submit}
        onCreateCategory={onCreateCategory}
      />
    </Dialog>
  )
}
