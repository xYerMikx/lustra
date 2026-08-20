import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M6 4v3M18 4v3M4.5 8h15M5.5 6.5h13A1.5 1.5 0 0120 8v11.5A1.5 1.5 0 0118.5 21h-13A1.5 1.5 0 014 19.5V8a1.5 1.5 0 011.5-1.5z" />
      <path {...STROKE} d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01" />
    </IconFrame>
  )
}
