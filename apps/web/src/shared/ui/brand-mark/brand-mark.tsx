type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      className={className}
      src="/brand/lumira-botanical-mark.png"
      alt=""
      width={256}
      height={256}
      draggable={false}
    />
  )
}
