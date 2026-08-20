'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import cn from 'classnames'

import { CheckIcon } from '@/shared/ui/icon-pack'
import { type SelectOption } from '@/shared/ui/select/select'
import styles from '@/shared/ui/select/select.module.css'

type MultiSelectProps = {
  values: string[]
  options: SelectOption[]
  onChange: (values: string[]) => void
  name?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  max?: number
  testId?: string
  'aria-label'?: string
}

export function MultiSelect({
  values,
  options,
  onChange,
  name,
  placeholder = 'Выберите',
  disabled = false,
  invalid = false,
  id,
  max,
  testId,
  'aria-label': ariaLabel,
}: MultiSelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = options.filter((option) => values.includes(option.value))
  const summary =
    selected.length === 0
      ? placeholder
      : selected.map((option) => option.label).join(', ')

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const openList = () => {
    if (disabled) {
      return
    }

    setActiveIndex(0)
    setOpen(true)
  }

  const toggleOption = (nextValue: string) => {
    if (values.includes(nextValue)) {
      onChange(values.filter((item) => item !== nextValue))

      return
    }

    if (max != null && values.length >= max) {
      return
    }

    onChange([...values, nextValue])
  }

  const handleTriggerClick = () => {
    if (open) {
      setOpen(false)

      return
    }

    openList()
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openList()
    }
  }

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, options.length - 1))

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))

      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[activeIndex]

      if (option) {
        toggleOption(option.value)
      }

      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className={styles.root} ref={rootRef}>
      {name
        ? values.map((value) => (
            <input key={value} type="hidden" name={name} value={value} />
          ))
        : null}
      <button
        id={id}
        type="button"
        className={cn(
          styles.trigger,
          open && styles.triggerOpen,
          invalid && styles.triggerInvalid,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        data-testid={testId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={cn(styles.value, selected.length === 0 && styles.placeholder)}
        >
          {summary}
        </span>
        <span
          className={cn(styles.chevron, open && styles.chevronOpen)}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          className={styles.list}
          role="listbox"
          aria-multiselectable="true"
          tabIndex={-1}
          aria-activedescendant={`${listId}-opt-${activeIndex}`}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = values.includes(option.value)
            const isActive = index === activeIndex
            const isDisabled =
              !isSelected && max != null && values.length >= max

            return (
              <li key={option.value} role="presentation">
                <button
                  id={`${listId}-opt-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={isDisabled}
                  className={cn(
                    styles.option,
                    styles.optionMulti,
                    isSelected && styles.optionSelected,
                    isActive && styles.optionActive,
                  )}
                  data-testid={option.testId}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleOption(option.value)}
                >
                  <span
                    className={cn(
                      styles.check,
                      isSelected && styles.checkOn,
                    )}
                    aria-hidden
                  >
                    {isSelected ? <CheckIcon className={styles.checkIcon} /> : null}
                  </span>
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
