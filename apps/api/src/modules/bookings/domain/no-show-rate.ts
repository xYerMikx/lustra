export function noShowRate(completedCount: number, noShowCount: number): string {
  const total = completedCount + noShowCount

  if (total === 0) {
    return '0.00'
  }

  return (Math.round((noShowCount / total) * 10000) / 100).toFixed(2)
}
