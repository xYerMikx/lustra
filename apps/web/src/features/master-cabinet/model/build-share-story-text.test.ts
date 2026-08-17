import { describe, expect, it } from 'vitest'

import { buildShareStoryText } from '@/features/master-cabinet/model/build-share-story-text'

describe('buildShareStoryText', () => {
  it('builds a caption with the master name and url', () => {
    expect(
      buildShareStoryText('Анна', 'http://localhost:3000/m/anna-nails'),
    ).toBe('Записаться к Анна на Lumira\nhttp://localhost:3000/m/anna-nails')
  })
})
