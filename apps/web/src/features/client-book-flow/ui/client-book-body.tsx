'use client'

import type { BookMasterCandidate } from '@/features/client-book-flow/model/types'
import { CLIENT_BOOK_COPY } from '@/features/client-book-flow/model/client-book-copy'
import type { useClientBookFlow } from '@/features/client-book-flow/model/use-client-book-flow'
import { MasterStep } from '@/features/client-book-flow/ui/master-step'
import { ServiceStep } from '@/features/client-book-flow/ui/service-step'
import { SlotStep } from '@/features/client-book-flow/ui/slot-step'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { Button } from '@/shared/ui/button'

type ClientBookBodyProps = {
  flow: ReturnType<typeof useClientBookFlow>
}

export function ClientBookBody({ flow }: ClientBookBodyProps) {
  const selectMaster = (master: BookMasterCandidate) => {
    void flow.pickMaster(master)
  }

  if (flow.step === 'service') {
    if (flow.sources.status === 'loading') {
      return <p className={styles.message}>{CLIENT_BOOK_COPY.serviceLoading}</p>
    }

    if (flow.sources.status === 'error') {
      return (
        <div>
          <p className={styles.error}>{flow.sources.errorMessage}</p>
          <Button
            type="button"
            variant="ghost"
            onClick={flow.sources.reload}
          >
            Повторить
          </Button>
        </div>
      )
    }

    return (
      <ServiceStep
        options={flow.serviceOptions}
        categories={flow.sources.categories}
        onSelect={flow.pickService}
      />
    )
  }

  if (flow.step === 'master') {
    if (!flow.selectedService) {
      return (
        <p className={styles.empty}>{CLIENT_BOOK_COPY.masterMissingService}</p>
      )
    }

    const selectMaster = (master: BookMasterCandidate) => {
      void flow.pickMaster(master)
    }

    return (
      <MasterStep
        serviceTitle={flow.selectedService.title}
        masters={flow.masterOptions}
        status={flow.masters.status}
        errorMessage={flow.masters.errorMessage}
        busy={flow.masterBusy}
        pickError={flow.masterError}
        onSelect={selectMaster}
        onRetry={flow.masters.reload}
      />
    )
  }

  if (!flow.publicMaster) {
    return <p className={styles.empty}>{CLIENT_BOOK_COPY.slotMissingMaster}</p>
  }

  return (
    <SlotStep master={flow.publicMaster} service={flow.selectedService} />
  )
}
