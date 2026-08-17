import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'

type OnboardingStepActionsProps = {
  submitting: boolean
  submitDisabled?: boolean
  submitLabel: string
  onSkip: () => void
  onBack?: () => void
}

export function OnboardingStepActions({
  submitting,
  submitDisabled = false,
  submitLabel,
  onSkip,
  onBack,
}: OnboardingStepActionsProps) {
  return (
    <div className={styles.actions}>
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={submitting}
          data-testid={TEST_ID.onboardingBack}
        >
          Назад
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        onClick={onSkip}
        disabled={submitting}
        data-testid={TEST_ID.onboardingSkip}
      >
        Пропустить
      </Button>
      <Button
        type="submit"
        className={styles.actionsGrow}
        disabled={submitting || submitDisabled}
        data-testid={TEST_ID.onboardingSubmit}
      >
        {submitting ? 'Сохраняем…' : submitLabel}
      </Button>
    </div>
  )
}
