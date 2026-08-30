'use client'

import { useState } from 'react'

import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'
import { CheckIcon, CopyIcon } from '@/shared/ui/icon-pack'
import styles from '@/shared/ui/status-screen/status-screen.module.css'

type StatusTraceProps = {
  traceId: string
}

export function StatusTrace({ traceId }: StatusTraceProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(traceId)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.trace} data-testid={TEST_ID.appErrorTrace}>
      <p className={styles.traceLabel}>Код ошибки</p>
      <div className={styles.traceValue}>
        <p className={styles.traceId}>{traceId}</p>
        <Button
          type="button"
          variant="icon"
          aria-label={copied ? 'Код скопирован' : 'Скопировать код ошибки'}
          title={copied ? 'Скопировано' : 'Скопировать'}
          onClick={handleCopy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </section>
  )
}
