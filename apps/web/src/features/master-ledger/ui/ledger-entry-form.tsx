'use client'

import { useState } from 'react'
import type { LedgerCategoryView, LedgerKind } from '@lustra/contracts'

import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { TextInput } from '@/shared/ui/field'
import { Select } from '@/shared/ui/select'
import styles from '@/features/master-ledger/ui/master-ledger.module.css'

type LedgerEntryFormProps = {
  from: string
  to: string
  categories: LedgerCategoryView[]
  onCreateEntry: (input: {
    kind: LedgerKind
    categoryId: string
    amount: string
    note?: string
    periodStart?: string
    periodEnd?: string
  }) => Promise<void>
  onCreateCategory: (name: string, kind: LedgerKind) => Promise<LedgerCategoryView>
}

export function LedgerEntryForm({
  from,
  to,
  categories,
  onCreateEntry,
  onCreateCategory,
}: LedgerEntryFormProps) {
  const [kind, setKind] = useState<LedgerKind>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const kindCategories = categories.filter((category) => category.kind === kind)
  const selectedId = kindCategories.some((category) => category.id === categoryId)
    ? categoryId
    : (kindCategories[0]?.id ?? '')

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
      <h2 className={styles.formTitle}>Новая строка</h2>
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
      <Field label="Сумма, BYN" htmlFor="entry-amount">
        <TextInput
          id="entry-amount"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
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
        <p className={styles.hint}>Чаевые не входят в сумму завершённого визита</p>
      )}
      {error ? <p className={styles.error}>{error}</p> : null}
      <Button type="submit" disabled={pending}>
        Записать
      </Button>
    </form>
  )
}
