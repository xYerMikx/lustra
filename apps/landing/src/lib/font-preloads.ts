import manropeCyrillic from '@fontsource-variable/manrope/files/manrope-cyrillic-wght-normal.woff2?url'
import manropeLatin from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url'
import playfairCyrillic from '@fontsource-variable/playfair-display/files/playfair-display-cyrillic-wght-normal.woff2?url'
import playfairLatin from '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2?url'

export const FONT_PRELOADS = [
  playfairCyrillic,
  playfairLatin,
  manropeCyrillic,
  manropeLatin,
] as const
