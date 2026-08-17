'use client'

import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import { Select, type SelectOption } from '@/shared/ui/select/select'

type FormSelectProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
  valueAsNumber?: boolean
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  disabled,
  id,
  'aria-label': ariaLabel,
  valueAsNumber = false,
}: FormSelectProps<TFieldValues>) {
  const { field, fieldState } = useController({
    control,
    name,
  })

  const stringValue =
    field.value == null || field.value === ''
      ? ''
      : String(field.value)

  return (
    <Select
      id={id}
      value={stringValue}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      invalid={Boolean(fieldState.error)}
      aria-label={ariaLabel}
      onChange={(next) => {
        field.onChange(valueAsNumber ? Number(next) : next)
      }}
    />
  )
}
