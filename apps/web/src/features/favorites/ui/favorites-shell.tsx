'use client'

import { MasterCard } from '@/entities/master'
import { useFavoritesList } from '@/features/favorites/model/use-favorites-list'
import styles from '@/features/favorites/ui/favorites.module.css'
import { Button, ButtonLink } from '@/shared/ui/button'

export function FavoritesShell() {
  const list = useFavoritesList()

  return (
    <section className={styles.shell}>
      <header>
        <p className={styles.eyebrow}>Кабинет клиента</p>
        <h1 className={styles.title}>Избранное</h1>
      </header>

      {list.status === 'loading' ? (
        <p className={styles.message}>Загружаем избранных мастеров…</p>
      ) : null}

      {list.status === 'error' ? (
        <div>
          <p className={styles.error}>{list.errorMessage}</p>
          <Button type="button" variant="ghost" onClick={list.reload}>
            Повторить
          </Button>
        </div>
      ) : null}

      {list.status === 'empty' ? (
        <div>
          <p className={styles.message}>
            Пока никого нет. Добавьте мастера с его страницы.
          </p>
          <ButtonLink href="/catalog" variant="ghost">
            К каталогу
          </ButtonLink>
        </div>
      ) : null}

      {list.status === 'success' ? (
        <ul className={styles.list}>
          {list.items.map((master) => (
            <li key={master.id}>
              <MasterCard master={master} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
