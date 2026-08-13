export function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-BY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}
