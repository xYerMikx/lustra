import cn from 'classnames'

import styles from '@/shared/ui/spinner/spinner.module.css'

type SpinnerProps = {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return <span className={cn(styles.spinner, className)} aria-hidden="true" />
}
