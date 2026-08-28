import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { listOgImageSpecs } from '../src/lib/og-pages.ts'

const require = createRequire(import.meta.url)
const landingRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = path.resolve(landingRoot, '../..')
const { chromium } = loadPlaywright()

const WIDTH = 1200
const HEIGHT = 630

function loadPlaywright() {
  const candidates = [
    path.join(repoRoot, 'apps/web/node_modules/@playwright/test'),
    path.join(repoRoot, 'node_modules/@playwright/test'),
    path.join(landingRoot, 'node_modules/@playwright/test'),
  ]

  for (const candidate of candidates) {
    try {
      return require(candidate)
    } catch {
      continue
    }
  }

  throw new Error(
    'Cannot find @playwright/test. Run pnpm install in the repo root.',
  )
}

function hasChromium(browsersDir) {
  if (!browsersDir || browsersDir === '0' || !existsSync(browsersDir)) {
    return false
  }

  try {
    return readdirSync(browsersDir).some((name) => name.startsWith('chromium'))
  } catch {
    return false
  }
}

function resolvePlaywrightBrowsersPath() {
  const homeCache = path.join(homedir(), '.cache', 'ms-playwright')
  const configured = process.env.PLAYWRIGHT_BROWSERS_PATH

  if (hasChromium(configured)) {
    return
  }

  const fallbacks = [homeCache, '/ms-playwright', '/opt/ms-playwright']

  for (const dir of fallbacks) {
    if (hasChromium(dir)) {
      process.env.PLAYWRIGHT_BROWSERS_PATH = dir

      return
    }
  }

  if (configured && configured !== '0' && !hasChromium(configured)) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = homeCache
  }
}

function installChromium() {
  const cliCandidates = [
    path.join(repoRoot, 'apps/web/node_modules/@playwright/test/cli.js'),
    path.join(repoRoot, 'node_modules/@playwright/test/cli.js'),
    path.join(repoRoot, 'apps/web/node_modules/playwright/cli.js'),
    path.join(repoRoot, 'node_modules/playwright/cli.js'),
  ]
  const cli = cliCandidates.find((candidate) => existsSync(candidate))

  if (!cli) {
    throw new Error('Cannot find Playwright CLI to install Chromium.')
  }

  const result = spawnSync(process.execPath, [cli, 'install', 'chromium'], {
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    throw new Error('playwright install chromium failed')
  }
}

async function launchChromium() {
  resolvePlaywrightBrowsersPath()

  try {
    return await chromium.launch()
  } catch (firstError) {
    const homeCache = path.join(homedir(), '.cache', 'ms-playwright')

    if (process.env.PLAYWRIGHT_BROWSERS_PATH !== homeCache) {
      process.env.PLAYWRIGHT_BROWSERS_PATH = homeCache

      try {
        return await chromium.launch()
      } catch {
        // install below
      }
    }

    installChromium()

    try {
      return await chromium.launch()
    } catch {
      throw firstError
    }
  }
}

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
        padding: 72px 56px 72px 84px;
        background:
          radial-gradient(740px 620px at 0% 0%, rgba(214, 163, 74, 0.74), transparent 62%),
          radial-gradient(680px 540px at 100% 100%, rgba(203, 90, 38, 0.74), transparent 58%),
          #faf7f4;
        color: #221a17;
      }

      .og::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.16;
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
        gap: 22px;
        max-width: 640px;
      }

      .brand {
        font-family: "Playfair Display", Georgia, serif;
        font-size: 144px;
        font-weight: 500;
        line-height: 0.9;
        letter-spacing: 0;
      }

      .tagline {
        font-family: Manrope, system-ui, sans-serif;
        font-size: 34px;
        font-weight: 500;
        line-height: 1.2;
        color: #6e5f58;
        letter-spacing: 1px;
      }

      .mark-frame {
        position: relative;
        z-index: 1;
        display: grid;
        flex-shrink: 0;
        place-items: center;
        width: 408px;
        height: 408px;
        overflow: hidden;
      }

      .mark {
        width: 526px;
        height: 526px;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <div class="og">
      <div class="copy">
        <p class="brand">Lumira</p>
        <p class="tagline">${escapeHtml(tagline)}</p>
      </div>
      <div class="mark-frame">
        <img class="mark" src="${markSrc}" width="256" height="256" alt="" />
      </div>
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

  const browser = await launchChromium()
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
