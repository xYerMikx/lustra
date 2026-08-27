export function openPortfolioSlide(
  onOpen: ((index: number) => void) | undefined,
  itemIndex: number,
): (() => void) | undefined {
  if (!onOpen) {
    return undefined
  }

  return () => {
    onOpen(itemIndex)
  }
}
