'use client'

import { useFavoriteToggle } from '@/features/favorites/model/use-favorite-toggle'
import styles from '@/features/favorites/ui/favorites.module.css'
import { Button, ButtonLink } from '@/shared/ui/button'

type FavoriteToggleProps = {
  masterId: string
  masterSlug: string
}

export function FavoriteToggle({ masterId, masterSlug }: FavoriteToggleProps) {
  const { viewer, favorited, busy, errorMessage, toggleFavorite } =
    useFavoriteToggle(masterId)

  if (viewer === 'other') {
    return null
  }

  if (viewer === 'loading') {
    return (
      <Button type="button" variant="ghost" disabled>
        Избранное
      </Button>
    )
  }

  if (viewer === 'guest') {
    const next = `/app/login?next=${encodeURIComponent(`/m/${masterSlug}`)}`

    return (
      <ButtonLink href={next} variant="ghost">
        В избранное
      </ButtonLink>
    )
  }

  return (
    <div className={styles.toggle}>
      <Button
        type="button"
        variant="ghost"
        disabled={busy}
        aria-pressed={favorited}
        onClick={() => void toggleFavorite()}
      >
        {favorited ? 'В избранном' : 'В избранное'}
      </Button>
      {errorMessage ? (
        <p className={styles.toggleError} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
