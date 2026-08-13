'use client'

import { Button, ButtonLink } from '@/shared/ui/button'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'

type StepPortfolioCtaProps = {
  onBack: () => void
  onSkip: () => void
}

export function StepPortfolioCta({ onBack, onSkip }: StepPortfolioCtaProps) {
  return (
    <div className={styles.form}>
      <p className={styles.copy}>
        Добавьте фото работ — так клиенты быстрее выберут вас. Можно загрузить
        сейчас или позже из кабинета.
      </p>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onBack}>
          Назад
        </Button>
        <Button type="button" variant="ghost" onClick={onSkip}>
          Пропустить
        </Button>
        <ButtonLink href="/app/master/portfolio" className={styles.actionsGrow}>
          Добавить фото
        </ButtonLink>
      </div>
    </div>
  )
}
