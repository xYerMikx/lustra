import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import { RemoveFavoriteUseCase } from '@/modules/favorites/app/remove-favorite.usecase'

const currentUser: AuthUser = {
  id: 'c1',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

describe('RemoveFavoriteUseCase', () => {
  it('removes the favorite for the current user', async () => {
    const favorites: FavoriteStore = {
      add: vi.fn(),
      remove: vi.fn().mockResolvedValue(undefined),
      has: vi.fn(),
      listMasterIds: vi.fn(),
    }
    const useCase = new RemoveFavoriteUseCase(favorites)

    await expect(useCase.execute(currentUser, 'm1')).resolves.toEqual({
      favorited: false,
    })
    expect(favorites.remove).toHaveBeenCalledWith(currentUser.id, 'm1')
  })
})
