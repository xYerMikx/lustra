import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CatalogIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M5 5.5h6v6H5z" />
      <path {...STROKE} d="M13 5.5h6v6h-6z" />
      <path {...STROKE} d="M5 13.5h6v6H5z" />
      <path {...STROKE} d="M13 13.5h6v6h-6z" />
    </IconFrame>
  )
}
