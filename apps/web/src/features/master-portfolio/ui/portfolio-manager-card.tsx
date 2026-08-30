'use client'

import cn from 'classnames'
import Image from 'next/image'
import type { PortfolioItemView } from '@lumira/contracts'

import { portfolioModerationLabel } from '@/features/master-portfolio/model/portfolio-moderation-label'
import { portfolioRatioClass } from '@/features/master-portfolio/model/portfolio-ratio-class'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { ConfirmPopover } from '@/shared/ui/confirm-popover'
import { Button } from '@/shared/ui/button'
import { CoverIcon, TrashIcon } from '@/shared/ui/icon-pack'
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
        <Image
          className={styles.image}
          src={item.url}
          alt={item.caption ?? 'Фото работы'}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          quality={90}
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
            variant="icon"
            disabled={busy}
            aria-label="Сделать обложкой"
            title="Обложка"
            data-testid={portfolioSetCoverTestId(item.id)}
            onClick={() => onSetCover(item.id)}
          >
            <CoverIcon />
          </Button>
        )}
        <ConfirmPopover
          title="Удалить это фото?"
          disabled={busy}
          trigger={<TrashIcon />}
          triggerLabel="Удалить фото"
          testId={portfolioRemoveTestId(item.id)}
          onConfirm={() => onRemove(item.id)}
        />
      </div>
    </article>
  )
}
