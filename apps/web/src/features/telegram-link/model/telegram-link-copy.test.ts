import { describe, expect, it } from 'vitest'

import { telegramLinkCopy } from '@/features/telegram-link/model/telegram-link-copy'

describe('telegramLinkCopy', () => {
  it('asks to connect when telegram is not linked', () => {
    expect(
      telegramLinkCopy({ linked: false, audience: 'master' }),
    ).toContain('Подключите Telegram')
  })

  it('explains master and client reminder timing', () => {
    expect(telegramLinkCopy({ linked: true, audience: 'master' })).toContain(
      '2 часа',
    )
    expect(telegramLinkCopy({ linked: true, audience: 'client' })).toContain(
      '24 часа',
    )
  })
})
