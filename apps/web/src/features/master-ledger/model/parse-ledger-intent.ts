export type LedgerComposerIntent = 'tip' | 'expense'

export function parseLedgerIntent(
  value: string | null | undefined,
): LedgerComposerIntent | null {
  if (value === 'tip' || value === 'expense') {
    return value
  }

  return null
}

export function parseLedgerKindFilter(
  value: string,
): 'income' | 'expense' | undefined {
  if (value === 'income' || value === 'expense') {
    return value
  }

  return undefined
}
