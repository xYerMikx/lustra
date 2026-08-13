'use client'

import { PORTFOLIO_MAX_ITEMS, type PortfolioItemView } from '@lustra/contracts'

import { PortfolioManagerGrid } from '@/features/master-portfolio/ui/portfolio-manager-grid'
import { PortfolioUploadControl } from '@/features/master-portfolio/ui/portfolio-upload-control'
import { Button, ButtonLink } from '@/shared/ui/button'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'

type MasterPortfolioBodyProps = {
  items: PortfolioItemView[]
  status: 'loading' | 'error' | 'empty' | 'success'
  errorMessage: string | null
  busy: boolean
  reload: () => void
  uploadFiles: (files: FileList | File[]) => Promise<void>
  setCover: (id: string) => Promise<void>
  removeItem: (id: string) => Promise<void>
}

export function MasterPortfolioBody({
  items,
  status,
  errorMessage,
  busy,
  reload,
  uploadFiles,
  setCover,
  removeItem,
}: MasterPortfolioBodyProps) {
  if (status === 'loading') {
    return <p className={styles.muted}>Загружаем портфолио…</p>
  }

  if (status === 'error') {
    return (
      <div>
        <p className={styles.error} role="alert">
          {errorMessage ?? 'Не удалось загрузить портфолио'}
        </p>
        <Button type="button" variant="ghost" onClick={reload}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className={styles.toolbar}>
        <PortfolioUploadControl busy={busy} onFiles={(files) => void uploadFiles(files)} />
        <p className={styles.count}>
          {items.length} из {PORTFOLIO_MAX_ITEMS}
        </p>
        <ButtonLink href="/app" variant="ghost">
          В кабинет
        </ButtonLink>
      </div>
      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {status === 'empty' ? (
        <p className={styles.muted}>Пока нет фото. Добавьте работы с телефона.</p>
      ) : (
        <PortfolioManagerGrid
          items={items}
          busy={busy}
          onSetCover={(id) => void setCover(id)}
          onRemove={(id) => void removeItem(id)}
        />
      )}
    </>
  )
}
