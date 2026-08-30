'use client'

import cn from 'classnames'
import dynamic from 'next/dynamic'
import type { LedgerPeriodPreset } from '@lumira/contracts'

import { buildLedgerBreakdown, buildLedgerSeries } from '@/features/master-ledger/model/build-ledger-series'
import { formatLedgerPeriodLabel } from '@/features/master-ledger/model/format-ledger-period'
import { detectLedgerPreset } from '@/features/master-ledger/model/ledger-range'
import { parseLedgerKindFilter } from '@/features/master-ledger/model/parse-ledger-intent'
import { useMasterLedger } from '@/features/master-ledger/model/use-master-ledger'
import { LedgerBreakdown } from '@/features/master-ledger/ui/ledger-breakdown'
import { LedgerEntryDialog } from '@/features/master-ledger/ui/ledger-entry-dialog'
import { LedgerEntryList } from '@/features/master-ledger/ui/ledger-entry-list'
import { LedgerQuickActions } from '@/features/master-ledger/ui/ledger-quick-actions'
import { LedgerSummaryCards } from '@/features/master-ledger/ui/ledger-summary-cards'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Select } from '@/shared/ui/select'

const LedgerSeriesChart = dynamic(
  () =>
    import('@/features/master-ledger/ui/ledger-series-chart').then(
      (module) => module.LedgerSeriesChart,
    ),
  { ssr: false },
)

const KIND_OPTIONS = [
  { value: '', label: 'Все операции' },
  { value: 'income', label: 'Доходы' },
  { value: 'expense', label: 'Расходы' },
]

const PRESETS: Array<{ id: LedgerPeriodPreset; label: string }> = [
  { id: 'week', label: 'Неделя' },
  { id: 'two_weeks', label: '2 недели' },
  { id: 'month', label: 'Месяц' },
]

export function MasterLedgerShell() {
  const ledger = useMasterLedger()

  if (ledger.status === 'error') {
    return (
      <section className={styles.section} data-testid={TEST_ID.pageMasterLedger}>
        <h1 className={styles.title}>Финансы</h1>
        <p className={styles.error}>{ledger.errorMessage ?? 'Ошибка'}</p>
        <Button type="button" variant="ghost" onClick={() => void ledger.reload()}>
          Повторить
        </Button>
      </section>
    )
  }

  const summary = ledger.data?.summary
  const categories = ledger.data?.categories ?? []
  const items = ledger.data?.items ?? []
  const categoryOptions = [
    { value: '', label: 'Все категории' },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ]
  const activePreset = detectLedgerPreset(ledger.from, ledger.to, new Date())
  const points = buildLedgerSeries(items, ledger.from, ledger.to)
  const breakdown = buildLedgerBreakdown(items)
  const currency = summary?.currency ?? 'BYN'

  return (
    <section className={styles.section} data-testid={TEST_ID.pageMasterLedger}>
      <header>
        <p className={styles.eyebrow}>Только для мастера</p>
        <h1 className={styles.title}>Финансы</h1>
        <p className={styles.period}>{formatLedgerPeriodLabel(ledger.from, ledger.to)}</p>
        <p className={styles.lead}>
          Завершённый визит попадает в доход без чаевых. Чаевые, аренду и материалы
          записываете сами — клиент эти цифры не видит.
        </p>
      </header>

      <div className={styles.tabs} role="group" aria-label="Период">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={cn(styles.tab, activePreset === preset.id && styles.tabActive)}
            onClick={() => ledger.setPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {summary ? <LedgerSummaryCards summary={summary} /> : null}

      {ledger.status === 'loading' && items.length === 0 ? (
        <p className={styles.empty}>Считаем финансы…</p>
      ) : null}

      <LedgerSeriesChart points={points} />
      <LedgerBreakdown rows={breakdown} currency={currency} />

      <LedgerQuickActions
        onTip={() => ledger.openComposer('tip')}
        onExpense={() => ledger.openComposer('expense')}
      />

      <div className={styles.filters}>
        <Field label="Тип" htmlFor="ledger-kind">
          <Select
            id="ledger-kind"
            value={ledger.kind ?? ''}
            options={KIND_OPTIONS}
            onChange={(value) => ledger.setKind(parseLedgerKindFilter(value))}
          />
        </Field>
        <Field label="Категория" htmlFor="ledger-category">
          <Select
            id="ledger-category"
            value={ledger.categoryId ?? ''}
            options={categoryOptions}
            onChange={(value) => ledger.setCategoryId(value === '' ? undefined : value)}
          />
        </Field>
      </div>

      {ledger.status === 'empty' ? (
        <div className={styles.emptyCard}>
          <p className={styles.empty}>
            За этот период пока пусто. Завершите визит — цена услуги появится здесь.
            Лаки, аренду и чаевые добавьте кнопками сверху.
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => ledger.openComposer('expense')}
            data-testid={TEST_ID.ledgerAddOpen}
          >
            Добавить расход
          </Button>
        </div>
      ) : (
        <LedgerEntryList
          items={items}
          onRemove={(item) => void ledger.removeEntry(item)}
        />
      )}

      {ledger.intent ? (
        <LedgerEntryDialog
          intent={ledger.intent}
          from={ledger.from}
          to={ledger.to}
          occurredOn={ledger.occurredOn}
          bookingId={ledger.bookingId}
          categories={categories}
          onClose={ledger.closeComposer}
          onCreateEntry={ledger.addEntry}
          onCreateCategory={ledger.addCategory}
        />
      ) : null}
    </section>
  )
}
