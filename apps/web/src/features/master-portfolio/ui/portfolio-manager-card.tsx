'use client'

import cn from 'classnames'
import type { PortfolioItemView } from '@lustra/contracts'

import { portfolioModerationLabel } from '@/features/master-portfolio/model/portfolio-moderation-label'
import { portfolioRatioClass } from '@/features/master-portfolio/model/portfolio-ratio-class'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { Button } from '@/shared/ui/button'
import {
  TEST_ID,
  portfolioCardTestId,
  portfolioRemoveTestId,
  portfolioSetCoverTestId,
} from '@/shared/lib/test-id'

type PortfolioManagerCardProps = {
  item: PortfolioItemView
  busy: boolean
  onSetCover: (id: string) => void
  onRemove: (id: string) => void
}

export function PortfolioManagerCard({
  item,
  busy,
  onSetCover,
  onRemove,
}: PortfolioManagerCardProps) {
  const ratioClass = styles[portfolioRatioClass(item.width, item.height)]
  const moderationLabel = portfolioModerationLabel(item.moderation)

  return (
    <article className={styles.card} data-testid={portfolioCardTestId(item.id)}>
      <div className={cn(styles.shot, ratioClass)}>
        <img
          className={styles.image}
          src={item.url}
          alt={item.caption ?? 'Фото работы'}
          width={item.width}
          height={item.height}
        />
        {item.isCover ? (
          <span className={styles.coverBadge} data-testid={TEST_ID.portfolioCoverBadge}>
            Обложка
          </span>
        ) : null}
        {moderationLabel ? (
          <span className={styles.moderationBadge}>{moderationLabel}</span>
        ) : null}
      </div>
      <div className={styles.cardActions}>
        {item.isCover ? null : (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            data-testid={portfolioSetCoverTestId(item.id)}
            onClick={() => onSetCover(item.id)}
          >
            Обложка
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          data-testid={portfolioRemoveTestId(item.id)}
          onClick={() => onRemove(item.id)}
        >
          Удалить
        </Button>
      </div>
    </article>
  )
}
