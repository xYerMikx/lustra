export function pickCoverItem<T extends { isCover: boolean }>(
  items: T[],
): T | null {
  return items.find((item) => item.isCover) ?? items[0] ?? null
}
