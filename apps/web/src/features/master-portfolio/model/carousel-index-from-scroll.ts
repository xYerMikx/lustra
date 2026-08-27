export function clampCarouselIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0
  }

  if (index < 0) {
    return 0
  }

  if (index > length - 1) {
    return length - 1
  }

  return index
}

export function carouselIndexFromScroll(
  scrollLeft: number,
  slideWidth: number,
  length: number,
): number {
  if (slideWidth <= 0 || length <= 0) {
    return 0
  }

  return clampCarouselIndex(Math.round(scrollLeft / slideWidth), length)
}

export function scrollLeftForIndex(index: number, slideWidth: number): number {
  if (slideWidth <= 0) {
    return 0
  }

  return index * slideWidth
}
