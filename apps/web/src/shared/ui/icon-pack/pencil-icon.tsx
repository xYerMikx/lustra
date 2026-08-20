import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function PencilIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M14.2 5.2l4.6 4.6M4 20l5.1-1.1L19.6 8.4a2 2 0 00-2.8-2.8L6.3 16.1 4 20z" />
    </IconFrame>
  )
}
