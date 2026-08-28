import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { listOgImageSpecs } from '../src/lib/og-pages.ts'

const require = createRequire(import.meta.url)
const landingRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(landingRoot, '../..')
const { chromium } = require(
  path.join(repoRoot, 'apps/web/node_modules/@playwright/test'),
)

const WIDTH = 1200
const HEIGHT = 630

function dataUrl(bytes, mime) {
  return `data:${mime};base64,${Buffer.from(bytes).toString('base64')}`
}

function ogHtml({
  tagline,
  fonts,
  markSrc,
}) {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face {
        font-family: "Playfair Display";
        src: url("${fonts.playfairCyrillic}") format("woff2");
        font-weight: 400 900;
        font-style: normal;
        unicode-range: U+0400-04FF;
      }

      @font-face {
        font-family: "Playfair Display";
        src: url("${fonts.playfairLatin}") format("woff2");
        font-weight: 400 900;
        font-style: normal;
        unicode-range: U+0000-00FF;
      }

      @font-face {
        font-family: Manrope;
        src: url("${fonts.manropeCyrillic}") format("woff2");
        font-weight: 400 800;
        font-style: normal;
        unicode-range: U+0400-04FF;
      }

      @font-face {
        font-family: Manrope;
        src: url("${fonts.manropeLatin}") format("woff2");
        font-weight: 400 800;
        font-style: normal;
        unicode-range: U+0000-00FF;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html,
      body {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        overflow: hidden;
        background: #faf7f4;
      }

      .og {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        padding: 88px 96px 88px 100px;
        background:
          radial-gradient(1200px 520px at -8% -20%, rgba(198, 161, 91, 0.28), transparent 58%),
          radial-gradient(900px 480px at 108% 118%, rgba(194, 94, 82, 0.18), transparent 54%),
          linear-gradient(135deg, #f6edd8 0%, #faf7f4 46%, #f3e4d8 100%);
        color: #221a17;
      }

      .og::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.14;
        mix-blend-mode: multiply;
        background-image: url("data:image/svg+xml,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/></svg>',
        )}");
      }

      .copy {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 680px;
      }

      .brand {
        font-family: "Playfair Display", Georgia, serif;
        font-size: 108px;
        font-weight: 600;
        line-height: 0.92;
        letter-spacing: -2px;
      }

      .tagline {
        font-family: Manrope, system-ui, sans-serif;
        font-size: 28px;
        font-weight: 500;
        line-height: 1.25;
        color: #6e5f58;
        letter-spacing: 0.2px;
      }

      .mark {
        position: relative;
        z-index: 1;
        width: 340px;
        height: 340px;
        object-fit: contain;
        flex-shrink: 0;
      }
    </style>
  </head>
  <body>
    <div class="og">
      <div class="copy">
        <p class="brand">Lumira</p>
        <p class="tagline">${escapeHtml(tagline)}</p>
      </div>
      <img class="mark" src="${markSrc}" width="256" height="256" alt="" />
    </div>
  </body>
</html>`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function loadAssets() {
  const fontRoot = path.join(landingRoot, 'node_modules/@fontsource-variable')
  const [
    playfairCyrillic,
    playfairLatin,
    manropeCyrillic,
    manropeLatin,
    mark,
  ] = await Promise.all([
    readFile(
      path.join(
        fontRoot,
        'playfair-display/files/playfair-display-cyrillic-wght-normal.woff2',
      ),
    ),
    readFile(
      path.join(
        fontRoot,
        'playfair-display/files/playfair-display-latin-wght-normal.woff2',
      ),
    ),
    readFile(
      path.join(fontRoot, 'manrope/files/manrope-cyrillic-wght-normal.woff2'),
    ),
    readFile(path.join(fontRoot, 'manrope/files/manrope-latin-wght-normal.woff2')),
    readFile(
      path.join(
        repoRoot,
        'apps/web/public/brand/lumira-botanical-mark.png',
      ),
    ),
  ])

  return {
    fonts: {
      playfairCyrillic: dataUrl(playfairCyrillic, 'font/woff2'),
      playfairLatin: dataUrl(playfairLatin, 'font/woff2'),
      manropeCyrillic: dataUrl(manropeCyrillic, 'font/woff2'),
      manropeLatin: dataUrl(manropeLatin, 'font/woff2'),
    },
    markSrc: dataUrl(mark, 'image/png'),
  }
}

async function main() {
  const assets = await loadAssets()
  const outDir = path.join(landingRoot, 'public')
  const webPublic = path.join(repoRoot, 'apps/web/public')
  await mkdir(outDir, { recursive: true })
  await mkdir(webPublic, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })

  try {
    for (const spec of listOgImageSpecs()) {
      await page.setContent(
        ogHtml({
          tagline: spec.tagline,
          fonts: assets.fonts,
          markSrc: assets.markSrc,
        }),
        { waitUntil: 'load' },
      )
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          [...document.images].map((image) =>
            image.decode().catch(() => undefined),
          ),
        )
      })

      const fileName = spec.path.replace(/^\//, '')
      const outPath = path.join(outDir, fileName)

      await page.locator('.og').screenshot({
        path: outPath,
        type: 'png',
        omitBackground: false,
      })

      if (spec.path === '/og.png') {
        await writeFile(path.join(webPublic, fileName), await readFile(outPath))
      }

      console.log(`wrote ${outPath}`)
    }
  } finally {
    await browser.close()
  }
}

await main()
