import { describe, expect, it, vi } from 'vitest'

import { submitWithSuccess } from '@/features/master-calendar/model/submit-with-success'

describe('submitWithSuccess', () => {
  it('runs the mutation then reports success', async () => {
    const mutate = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    const submit = submitWithSuccess(mutate, onSuccess, 'Блок сохранён')

    await submit({ id: '1' })

    expect(mutate).toHaveBeenCalledWith({ id: '1' })
    expect(onSuccess).toHaveBeenCalledWith('Блок сохранён')
  })

  it('does not report success when the mutation fails', async () => {
    const mutate = vi.fn().mockRejectedValue(new Error('fail'))
    const onSuccess = vi.fn()
    const submit = submitWithSuccess(mutate, onSuccess, 'Клиент записан')

    await expect(submit()).rejects.toThrow('fail')
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
