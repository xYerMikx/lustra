import cn from 'classnames'

import {
  ONBOARDING_STEPS,
  stepStatus,
  type OnboardingStepId,
} from '@/features/master-onboarding/model/onboarding-steps'
import { StepCheckIcon } from '@/features/master-onboarding/ui/step-check-icon'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { onboardingProgressTestId } from '@/shared/lib/test-id'

type OnboardingProgressProps = {
  currentStepId: OnboardingStepId
}

export function OnboardingProgress({ currentStepId }: OnboardingProgressProps) {
  return (
    <ol className={styles.steps} aria-label="Этапы онбординга">
      {ONBOARDING_STEPS.map((step, index) => {
        const status = stepStatus(step.id, currentStepId)

        return (
          <li
            key={step.id}
            className={cn(
              styles.stepItem,
              status === 'active' && styles.stepItemActive,
              status === 'done' && styles.stepItemDone,
            )}
            aria-current={status === 'active' ? 'step' : undefined}
            data-testid={onboardingProgressTestId(step.id)}
            data-status={status}
          >
            <span className={styles.stepIndex} aria-hidden>
              {status === 'done' ? (
                <StepCheckIcon className={styles.stepCheckIcon} />
              ) : (
                index + 1
              )}
            </span>
            <span className={styles.stepLabel}>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
