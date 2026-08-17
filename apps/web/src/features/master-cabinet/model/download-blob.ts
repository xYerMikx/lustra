export function downloadBlob(filename: string, blob: Blob): void {
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => {
    URL.revokeObjectURL(href)
  }, 1000)
}

export function downloadDataUrl(filename: string, dataUrl: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
}
