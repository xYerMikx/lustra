'use client'

import { TEST_ID } from '@/shared/lib/test-id'
import { formatByn } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { TextInput } from '@/shared/ui/field'
import { Select } from '@/shared/ui/select'
import { useMasterLedger } from '@/features/master-ledger/model/use-master-ledger'
import { LedgerEntryForm } from '@/features/master-ledger/ui/ledger-entry-form'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

const KIND_OPTIONS = [
  { value: '', label: 'Все операции' },
  { value: 'income', label: 'Доходы' },
  { value: 'expense', label: 'Расходы' },
]

export function MasterLedgerShell() {
  const ledger = useMasterLedger()

  if (ledger.status === 'error') {
    return (
      <section className={styles.section} data-testid={TEST_ID.pageMasterLedger}>
        <h1 className={styles.title}>Касса</h1>
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

  return (
    <section className={styles.section} data-testid={TEST_ID.pageMasterLedger}>
      <p className={styles.eyebrow}>Только для мастера</p>
      <h1 className={styles.title}>Касса</h1>
      <p className={styles.lead}>
        Визит после завершения попадает в доход без чаевых. Чаевые и расходы —
        отдельными строками, с меткой вроде «Азер».
      </p>

      <div className={styles.presets} role="group" aria-label="Период">
        <Button type="button" variant="ghost" onClick={() => ledger.setPreset('week')}>
          Неделя
        </Button>
        <Button type="button" variant="ghost" onClick={() => ledger.setPreset('two_weeks')}>
          Две недели
        </Button>
        <Button type="button" variant="ghost" onClick={() => ledger.setPreset('month')}>
          Месяц
        </Button>
      </div>

      <div className={styles.filters}>
        <Field label="Тип" htmlFor="ledger-kind">
          <Select
            id="ledger-kind"
            value={ledger.kind ?? ''}
            options={KIND_OPTIONS}
            onChange={(value) => ledger.setKind(value === '' ? undefined : value === 'income' ? 'income' : 'expense')}
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

      {summary ? (
        <ul className={styles.summary}>
          <li>
            <span>Доход</span>
            <strong>{formatByn(Number(summary.incomeTotal), summary.currency)}</strong>
          </li>
          <li>
            <span>Расход</span>
            <strong>{formatByn(Number(summary.expenseTotal), summary.currency)}</strong>
          </li>
          <li>
            <span>Итог</span>
            <strong>{formatByn(Number(summary.netTotal), summary.currency)}</strong>
          </li>
        </ul>
      ) : null}

      <LedgerEntryForm
        from={ledger.from}
        to={ledger.to}
        categories={categories}
        onCreateEntry={ledger.addEntry}
        onCreateCategory={ledger.addCategory}
      />

      {ledger.status === 'loading' && items.length === 0 ? (
        <p className={styles.empty}>Считаем кассу…</p>
      ) : null}

      {ledger.status === 'empty' ? (
        <p className={styles.empty}>За этот период пока нет строк</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div>
                <p className={styles.rowTitle}>
                  {item.kind === 'income' ? 'Доход' : 'Расход'} · {item.categoryName}
                </p>
                <p className={styles.meta}>
                  {item.occurredOn}
                  {item.serviceTitle ? ` · ${item.serviceTitle}` : ''}
                  {item.note ? ` · ${item.note}` : ''}
                  {item.source === 'booking' ? ' · визит' : ''}
                </p>
              </div>
              <div className={styles.rowAmount}>
                <span>
                  {item.kind === 'expense' ? '−' : '+'}
                  {formatByn(Number(item.amount), item.currency)}
                </span>
                {item.source === 'manual' ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void ledger.removeEntry(item)}
                  >
                    Удалить
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
