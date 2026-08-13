import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { AddFavoriteUseCase } from '@/modules/favorites/app/add-favorite.usecase'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import type { CatalogMasterRecord } from '@/modules/master-profile/domain/map-catalog-master'

const currentUser: AuthUser = {
  id: 'c1',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

const published: CatalogMasterRecord = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'anna-a1b2c3',
  displayName: 'Анна',
  headline: null,
  boostPriority: 0,
  locations: [],
  services: [],
  stats: null,
}

function buildFavorites(overrides: Partial<FavoriteStore> = {}): FavoriteStore {
  return {
    add: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn(),
    has: vi.fn(),
    listMasterIds: vi.fn(),
    ...overrides,
  }
}

function buildMasters(overrides: Partial<PublicMasterStore> = {}): PublicMasterStore {
  return {
    findPublicBySlug: vi.fn(),
    findPublishedById: vi.fn().mockResolvedValue(published),
    listPublishedByIds: vi.fn(),
    searchPublished: vi.fn(),
    ...overrides,
  }
}

describe('AddFavoriteUseCase', () => {
  it('saves a published master for the current user', async () => {
    const favorites = buildFavorites()
    const masters = buildMasters()
    const useCase = new AddFavoriteUseCase(favorites, masters)

    await expect(useCase.execute(currentUser, published.id)).resolves.toEqual({
      favorited: true,
    })
    expect(favorites.add).toHaveBeenCalledWith(currentUser.id, published.id)
  })

  it('returns NOT_FOUND when the master is not published', async () => {
    const favorites = buildFavorites()
    const masters = buildMasters({
      findPublishedById: vi.fn().mockResolvedValue(null),
    })
    const useCase = new AddFavoriteUseCase(favorites, masters)

    await expect(useCase.execute(currentUser, published.id)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
    expect(favorites.add).not.toHaveBeenCalled()
  })

  it('is idempotent when the favorite already exists', async () => {
    const favorites = buildFavorites()
    const useCase = new AddFavoriteUseCase(favorites, buildMasters())

    await useCase.execute(currentUser, published.id)
    await useCase.execute(currentUser, published.id)

    expect(favorites.add).toHaveBeenCalledTimes(2)
  })
})
