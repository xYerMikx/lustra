import { z } from 'zod'

export const ruZodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type: {
      if (issue.received === 'undefined' || issue.received === 'null') {
        return { message: 'Заполните поле' }
      }

      return { message: 'Некорректное значение' }
    }

    case z.ZodIssueCode.too_small: {
      if (issue.type === 'string') {
        if (issue.minimum === 1) {
          return { message: 'Заполните поле' }
        }

        return { message: `Минимум ${issue.minimum} символов` }
      }

      if (issue.type === 'array') {
        return { message: `Выберите хотя бы ${issue.minimum}` }
      }

      return { message: ctx.defaultError }
    }

    case z.ZodIssueCode.too_big: {
      if (issue.type === 'string') {
        return { message: `Максимум ${issue.maximum} символов` }
      }

      if (issue.type === 'array') {
        return { message: `Можно выбрать не больше ${issue.maximum}` }
      }

      return { message: ctx.defaultError }
    }

    case z.ZodIssueCode.invalid_string: {
      if (issue.validation === 'email') {
        return { message: 'Некорректный email' }
      }

      if (issue.validation === 'uuid') {
        return { message: 'Некорректный идентификатор' }
      }

      if (issue.validation === 'datetime') {
        return { message: 'Некорректная дата' }
      }

      if (issue.validation === 'url') {
        return { message: 'Некорректная ссылка' }
      }

      return { message: 'Некорректное значение' }
    }

    default:
      return { message: ctx.defaultError }
  }
}

export function applyRuZodErrorMap(): void {
  z.setErrorMap(ruZodErrorMap)
}

applyRuZodErrorMap()
