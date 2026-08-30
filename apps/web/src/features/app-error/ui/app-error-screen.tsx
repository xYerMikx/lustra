'use client'

import Link from 'next/link'

import { isDevelopment } from '@/shared/lib/is-development'
import { resolveErrorTrace } from '@/shared/lib/resolve-error-trace'
import { TEST_ID } from '@/shared/lib/test-id'
import { useLastRequestId } from '@/shared/lib/use-last-request-id'
import { ButtonLink } from '@/shared/ui/button'
import { StatusScreen, StatusTrace } from '@/shared/ui/status-screen'

type AppErrorScreenProps = {
  error: Error & { digest?: string }
}

export function AppErrorScreen({ error }: AppErrorScreenProps) {
  const storedRequestId = useLastRequestId()

  const traceId = isDevelopment
    ? resolveErrorTrace(error, storedRequestId)
    : undefined

  return (
    <StatusScreen
      brand={<Link href="/">Lumira</Link>}
      title="Сервис временно недоступен"
      message="Уже разбираемся. Попробуйте зайти позже или вернитесь на главную."
      testId={TEST_ID.pageAppError}
      actions={
        <ButtonLink href="/" data-testid={TEST_ID.appErrorHome}>
          На главную
        </ButtonLink>
      }
      footer={traceId ? <StatusTrace traceId={traceId} /> : null}
    />
  )
}
