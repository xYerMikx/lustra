import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import { ListFavoritesUseCase } from '@/modules/favorites/app/list-favorites.usecase'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import type { CatalogMasterRecord } from '@/modules/master-profile/domain/map-catalog-master'

const currentUser: AuthUser = {
  id: 'c1',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

function record(id: string, slug: string): CatalogMasterRecord {
  return {
    id,
    slug,
    displayName: slug,
    headline: null,
    boostPriority: 0,
    locations: [],
    services: [],
    stats: null,
  }
}

describe('ListFavoritesUseCase', () => {
  it('returns published cards in favorite order and skips unpublished', async () => {
    const first = record('m1', 'anna')
    const third = record('m3', 'olga')
    const favorites: FavoriteStore = {
      add: vi.fn(),
      remove: vi.fn(),
      has: vi.fn(),
      listMasterIds: vi.fn().mockResolvedValue(['m3', 'm2', 'm1']),
    }
    const masters: PublicMasterStore = {
      findPublicBySlug: vi.fn(),
      findPublishedById: vi.fn(),
      listPublishedByIds: vi.fn().mockResolvedValue([first, third]),
      searchPublished: vi.fn(),
    }
    const useCase = new ListFavoritesUseCase(favorites, masters)

    const result = await useCase.execute(currentUser)

    expect(masters.listPublishedByIds).toHaveBeenCalledWith(['m3', 'm2', 'm1'])
    expect(result.items.map((item) => item.id)).toEqual(['m3', 'm1'])
  })
})
