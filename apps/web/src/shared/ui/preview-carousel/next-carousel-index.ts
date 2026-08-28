export function nextCarouselIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return (index + 1) % total
}
