export function subscribePortfolioViewport(onChange: () => void): () => void {
  window.addEventListener('resize', onChange)

  return () => {
    window.removeEventListener('resize', onChange)
  }
}

export function getPortfolioViewportWidth(): number {
  return window.innerWidth
}

export function getServerPortfolioViewportWidth(): number {
  return 0
}
