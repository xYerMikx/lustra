type StepCheckIconProps = {
  className?: string
}

export function StepCheckIcon({ className }: StepCheckIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="12"
      height="12"
      aria-hidden
      focusable="false"
    >
      <path
        d="M3.2 8.2 6.4 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
