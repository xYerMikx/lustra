export type SuggestKeyResult = {
  preventDefault: boolean
  open: boolean
  activeIndex: number
  pick: boolean
}

export function applySuggestKey(input: {
  key: string
  open: boolean
  activeIndex: number
  matchCount: number
}): SuggestKeyResult {
  const listVisible = input.open && input.matchCount > 0
  const lastIndex = Math.max(input.matchCount - 1, 0)

  if (!listVisible) {
    return {
      preventDefault: false,
      open: input.open,
      activeIndex: input.activeIndex,
      pick: false,
    }
  }

  if (input.key === 'ArrowDown') {
    return {
      preventDefault: true,
      open: true,
      activeIndex: Math.min(input.activeIndex + 1, lastIndex),
      pick: false,
    }
  }

  if (input.key === 'ArrowUp') {
    return {
      preventDefault: true,
      open: true,
      activeIndex: Math.max(input.activeIndex - 1, 0),
      pick: false,
    }
  }

  if (input.key === 'Enter') {
    return {
      preventDefault: true,
      open: false,
      activeIndex: input.activeIndex,
      pick: true,
    }
  }

  if (input.key === 'Escape') {
    return {
      preventDefault: true,
      open: false,
      activeIndex: input.activeIndex,
      pick: false,
    }
  }

  return {
    preventDefault: false,
    open: input.open,
    activeIndex: input.activeIndex,
    pick: false,
  }
}
