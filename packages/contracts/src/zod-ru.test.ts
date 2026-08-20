import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { applyRuZodErrorMap } from './zod-ru'

applyRuZodErrorMap()

describe('ru Zod error map', () => {
  it('translates empty string and email errors', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1).max(128),
    })

    const result = schema.safeParse({ email: 'nope', password: '' })

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    const byPath = Object.fromEntries(
      result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
    )

    expect(byPath.email).toBe('Некорректный email')
    expect(byPath.password).toBe('Заполните поле')
  })

  it('translates minimum length above one character', () => {
    const result = z.string().min(8).safeParse('short')

    expect(result.success).toBe(false)

    if (result.success) {
      return
    }

    expect(result.error.issues[0]?.message).toBe('Минимум 8 символов')
  })
})
