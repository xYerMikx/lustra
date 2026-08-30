import styles from '@/shared/ui/status-screen/status-screen.module.css'

export function StatusMark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <svg className={styles.markIcon} viewBox="0 0 24 24" focusable="false">
        <circle
          cx="12"
          cy="12"
          r="8.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M12 8v5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.2" r="1" fill="currentColor" />
      </svg>
    </span>
  )
}
