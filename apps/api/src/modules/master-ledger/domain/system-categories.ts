export type LedgerKind = 'income' | 'expense'

export type SystemCategoryDef = {
  kind: LedgerKind
  slug: string
  name: string
}

export const SYSTEM_LEDGER_CATEGORIES: readonly SystemCategoryDef[] = [
  { kind: 'income', slug: 'service', name: 'Услуги' },
  { kind: 'income', slug: 'tip', name: 'Чаевые' },
  { kind: 'expense', slug: 'materials', name: 'Материалы' },
  { kind: 'expense', slug: 'rent', name: 'Аренда' },
  { kind: 'expense', slug: 'other', name: 'Прочее' },
]

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .slice(0, 48)
}
