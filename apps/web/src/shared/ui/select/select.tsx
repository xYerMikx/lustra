'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import cn from 'classnames'

import styles from '@/shared/ui/select/select.module.css'

export type SelectOption = {
  value: string
  label: string
  testId?: string
}

type SelectProps = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  name?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  id?: string
  'aria-label'?: string
}

export function Select({
  value,
  options,
  onChange,
  name,
  placeholder = 'Выберите',
  disabled = false,
  invalid = false,
  id,
  'aria-label': ariaLabel,
}: SelectProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = options.find((option) => option.value === value) ?? null
  const selectedIndex = options.findIndex((option) => option.value === value)

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

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const chooseOption = (nextValue: string) => {
    onChange(nextValue)
    setOpen(false)
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
        chooseOption(option.value)
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
      {name ? <input type="hidden" name={name} value={value} /> : null}
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
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span
          className={cn(styles.value, !selected && styles.placeholder)}
        >
          {selected?.label ?? placeholder}
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
          tabIndex={-1}
          aria-activedescendant={`${listId}-opt-${activeIndex}`}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <li key={option.value} role="presentation">
                <button
                  id={`${listId}-opt-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    styles.option,
                    isSelected && styles.optionSelected,
                    isActive && styles.optionActive,
                  )}
                  data-testid={option.testId}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseOption(option.value)}
                >
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
