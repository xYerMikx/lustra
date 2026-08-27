'use client'

import { useState } from 'react'
import type {
  CreateLedgerEntryInput,
  LedgerCategoryView,
  LedgerKind,
} from '@lustra/contracts'

import { findCategoryBySlug } from '@/features/master-ledger/model/find-category-by-slug'
import type { LedgerComposerIntent } from '@/features/master-ledger/model/parse-ledger-intent'
import { Button } from '@/shared/ui/button'
import { Field, TextInput } from '@/shared/ui/field'
import { Select } from '@/shared/ui/select'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

type LedgerEntryFormProps = {
  intent: LedgerComposerIntent
  from: string
  to: string
  occurredOn?: string
  bookingId?: string
  categories: LedgerCategoryView[]
  onCreateEntry: (input: CreateLedgerEntryInput) => Promise<void>
  onCreateCategory: (name: string, kind: LedgerKind) => Promise<LedgerCategoryView>
}

export function LedgerEntryForm({
  intent,
  from,
  to,
  occurredOn,
  bookingId,
  categories,
  onCreateEntry,
  onCreateCategory,
}: LedgerEntryFormProps) {
  const [kind, setKind] = useState<LedgerKind>(intent === 'tip' ? 'income' : 'expense')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const kindCategories = categories.filter((category) => category.kind === kind)
  const preferredSlug = kind === 'income' ? 'tip' : 'materials'
  const fallback = findCategoryBySlug(kindCategories, preferredSlug, kind)
  const selectedId = kindCategories.some((category) => category.id === categoryId)
    ? categoryId
    : (fallback?.id ?? '')

  const submit = async () => {
    setError(null)

    if (!selectedId) {
      setError('Добавьте категорию')

      return
    }

    setPending(true)

    try {
      await onCreateEntry({
        kind,
        categoryId: selectedId,
        amount,
        note: note.trim() || undefined,
        periodStart: kind === 'expense' ? from : undefined,
        periodEnd: kind === 'expense' ? to : undefined,
        occurredOn: kind === 'income' ? occurredOn : undefined,
        bookingId: kind === 'income' ? bookingId : undefined,
      })
      setAmount('')
      setNote('')
    } catch {
      setError('Не удалось сохранить строку')
    } finally {
      setPending(false)
    }
  }

  const addCategory = async () => {
    setError(null)

    try {
      const created = await onCreateCategory(newCategoryName, kind)
      setCategoryId(created.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch {
      setError('Не удалось создать категорию')
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <Field label="Тип" htmlFor="entry-kind">
        <Select
          id="entry-kind"
          value={kind}
          options={[
            { value: 'income', label: 'Доход / чаевые' },
            { value: 'expense', label: 'Расход' },
          ]}
          onChange={(value) => setKind(value === 'income' ? 'income' : 'expense')}
        />
      </Field>
      <Field label="Категория" htmlFor="entry-category">
        <Select
          id="entry-category"
          value={selectedId}
          options={kindCategories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
          onChange={setCategoryId}
        />
      </Field>
      {showNewCategory ? (
        <Field label="Своя метка, например Азер" htmlFor="entry-new-category">
          <div className={styles.inline}>
            <TextInput
              id="entry-new-category"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
            />
            <Button type="button" variant="ghost" onClick={() => void addCategory()}>
              Добавить
            </Button>
          </div>
        </Field>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowNewCategory(true)}
        >
          Своя категория
        </Button>
      )}
      <Field label="Сумма, BYN" htmlFor="entry-amount">
        <TextInput
          id="entry-amount"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          data-testid={TEST_ID.ledgerAmount}
        />
      </Field>
      <Field label="Комментарий" htmlFor="entry-note">
        <TextInput
          id="entry-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
      {kind === 'expense' ? (
        <p className={styles.hint}>
          Расход ляжет на выбранный сверху период: {from} — {to}
        </p>
      ) : (
        <p className={styles.hint}>
          Чаевые не входят в сумму завершённого визита
          {bookingId ? ' и привяжутся к этой записи.' : '.'}
        </p>
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button type="submit" disabled={pending} data-testid={TEST_ID.ledgerEntrySubmit}>
        Записать
      </Button>
    </form>
  )
}
