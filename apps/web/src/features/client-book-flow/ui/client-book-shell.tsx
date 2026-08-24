'use client'

import { useClientBookFlow } from '@/features/client-book-flow/model/use-client-book-flow'
import { MasterStep } from '@/features/client-book-flow/ui/master-step'
import { ServiceStep } from '@/features/client-book-flow/ui/service-step'
import { SlotStep } from '@/features/client-book-flow/ui/slot-step'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

const STEP_TITLE = {
  service: 'Выберите услугу',
  master: 'Выберите мастера',
  slot: 'Выберите время',
} as const

export function ClientBookShell() {
  const flow = useClientBookFlow()

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageClientBook}>
      <header>
        <p className={styles.eyebrow}>Кабинет клиента</p>
        <h1 className={styles.title}>{STEP_TITLE[flow.step]}</h1>
      </header>

      {flow.step !== 'service' ? (
        <button
          type="button"
          className={styles.back}
          data-testid={TEST_ID.clientBookBack}
          onClick={
            flow.step === 'slot' ? flow.backToMaster : flow.backToService
          }
        >
          Назад
        </button>
      ) : null}

      {flow.step === 'service' && flow.sources.status === 'loading' ? (
        <p className={styles.message}>Загружаем услуги…</p>
      ) : null}

      {flow.step === 'service' && flow.sources.status === 'error' ? (
        <div>
          <p className={styles.error}>{flow.sources.errorMessage}</p>
          <Button type="button" variant="ghost" onClick={flow.sources.reload}>
            Повторить
          </Button>
        </div>
      ) : null}

      {flow.step === 'service' && flow.sources.status === 'success' ? (
        <ServiceStep
          options={flow.serviceOptions}
          categories={flow.sources.categories}
          onSelect={flow.pickService}
        />
      ) : null}

      {flow.step === 'master' && flow.selectedService ? (
        <MasterStep
          serviceTitle={flow.selectedService.title}
          masters={flow.masterOptions}
          status={flow.masters.status}
          errorMessage={flow.masters.errorMessage}
          busy={flow.masterBusy}
          pickError={flow.masterError}
          onSelect={flow.pickMaster}
          onRetry={flow.masters.reload}
        />
      ) : null}

      {flow.step === 'slot' && flow.publicMaster ? (
        <SlotStep
          master={flow.publicMaster}
          service={flow.selectedService}
        />
      ) : null}
    </section>
  )
}
