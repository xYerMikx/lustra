import cn from 'classnames'

import styles from '@/features/master-calendar/ui/calendar.module.css'

type CalendarNoticeProps = {
  tone: 'success' | 'error'
  text: string
}

export function CalendarNotice({ tone, text }: CalendarNoticeProps) {
  const isError = tone === 'error'

  return (
    <p
      className={cn(
        styles.notice,
        isError ? styles.noticeError : styles.noticeSuccess,
      )}
      role={isError ? 'alert' : 'status'}
    >
      {text}
    </p>
  )
}
