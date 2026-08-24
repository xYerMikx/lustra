export function joinDotLabels(
  parts: Array<string | null | undefined>,
): string {
  return parts
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .join(' · ')
}
