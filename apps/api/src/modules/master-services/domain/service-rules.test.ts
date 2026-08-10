import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { assertDurationStep } from '@/modules/master-services/domain/service-rules'

describe('assertDurationStep', () => {
  it('accepts positive multiples of 15', () => {
    expect(() => assertDurationStep(15)).not.toThrow()
    expect(() => assertDurationStep(90)).not.toThrow()
  })

  it('rejects non-step durations', () => {
    expect(() => assertDurationStep(20)).toThrow(DomainError)
    expect(() => assertDurationStep(0)).toThrow(DomainError)
  })
})
