'use client'

import { Button, ButtonLink } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'
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
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          data-testid={TEST_ID.onboardingBack}
        >
          Назад
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          data-testid={TEST_ID.onboardingSkip}
        >
          Пропустить
        </Button>
        <ButtonLink
          href="/app/master/portfolio"
          className={styles.actionsGrow}
          data-testid={TEST_ID.onboardingPortfolioAdd}
        >
          Добавить фото
        </ButtonLink>
      </div>
    </div>
  )
}
