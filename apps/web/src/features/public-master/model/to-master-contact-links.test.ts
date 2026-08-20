import { describe, expect, it } from 'vitest'

import { toMasterContactLinks } from '@/features/public-master/model/to-master-contact-links'

describe('toMasterContactLinks', () => {
  it('returns an empty list when contact is missing', () => {
    expect(toMasterContactLinks(null)).toEqual([])
  })

  it('builds Instagram and Telegram hrefs without @', () => {
    expect(
      toMasterContactLinks({
        publicPhone: '+375291112233',
        instagram: '@anna.nails',
        telegramUsername: '@anna_nails',
        website: 'https://anna.example',
      }),
    ).toEqual([
      {
        label: 'Instagram',
        href: 'https://instagram.com/anna.nails',
        openInNewTab: true,
      },
      {
        label: 'Telegram',
        href: 'https://t.me/anna_nails',
        openInNewTab: true,
      },
      {
        label: '+375291112233',
        href: 'tel:+375291112233',
        openInNewTab: false,
      },
      {
        label: 'Сайт',
        href: 'https://anna.example',
        openInNewTab: true,
      },
    ])
  })
})
