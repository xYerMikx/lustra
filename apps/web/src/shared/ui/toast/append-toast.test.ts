import { describe, expect, it } from 'vitest'

import {
  appendToast,
  markToastLeaving,
  removeToast,
  type ToastRecord,
} from '@/shared/ui/toast/append-toast'

function toast(id: string): ToastRecord {
  return { id, tone: 'info', message: id, leaving: false }
}

describe('appendToast', () => {
  it('keeps only the latest toasts within the stack limit', () => {
    const stacked = ['a', 'b', 'c', 'd'].reduce(
      (list, id) => appendToast(list, toast(id), 3),
      [] as ToastRecord[],
    )

    expect(stacked.map((item) => item.id)).toEqual(['b', 'c', 'd'])
  })
})

describe('markToastLeaving', () => {
  it('flags only the matching toast as leaving', () => {
    const list = markToastLeaving([toast('a'), toast('b')], 'a')

    expect(list[0]?.leaving).toBe(true)
    expect(list[1]?.leaving).toBe(false)
  })
})

describe('removeToast', () => {
  it('drops the matching toast', () => {
    expect(removeToast([toast('a'), toast('b')], 'a').map((item) => item.id)).toEqual([
      'b',
    ])
  })
})
