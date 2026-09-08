/**
 * Rasterises the brand SVGs into the PNG sizes social platforms expect.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Source of truth is always the SVG in public/brand/. Never edit the PNGs by
 * hand; re-run this instead so every size stays in sync.
 */
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const brandDir = path.join(root, 'public', 'brand')
const outDir = path.join(brandDir, 'png')

const OLIVE = '#4F5D31'
const CANVAS = '#FAF9F5'
const INK = '#1B1B16'
const INK_SOFT = '#4A4A40'
const LINE = '#E2DFD2'

/** Avatar / profile picture sizes across the platforms that matter. */
const AVATAR_SIZES = [
  { size: 32, note: 'favicon fallback' },
  { size: 64, note: 'inline / email' },
  { size: 128, note: 'Discord, small avatars' },
  { size: 256, note: 'Telegram' },
  { size: 400, note: 'X / Twitter profile' },
  { size: 500, note: 'general social avatar' },
  { size: 512, note: 'PWA icon, GitHub org' },
  { size: 1024, note: 'master / App Store' },
]

async function render(svgPath, outPath, size, background) {
  const svg = await readFile(svgPath)
  let pipeline = sharp(svg, { density: 384 }).resize(size, size, {
    fit: 'contain',
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  })
  if (background) pipeline = pipeline.flatten({ background })
  await pipeline.png({ compressionLevel: 9 }).toFile(outPath)
  return outPath
}

/**
 * Social banner. Composed as an SVG so the wordmark, rule and grid all sit on
 * the same optical grid the site uses, then rasterised once.
 *
 * Type is drawn with a Georgia/serif stack rather than Newsreader: librsvg
 * resolves fonts through the host, and a webfont is not guaranteed to be
 * installed. Georgia is the closest editorial serif present on Windows and
 * macOS, and the fallback chain degrades sanely elsewhere.
 */
async function banner({ w, h, name, title, tagline, markSize, gap }) {
  const markPng = await sharp(await readFile(path.join(brandDir, 'veyl-mark.svg')), {
    density: 512,
  })
    .resize(markSize, markSize)
    .png()
    .toBuffer()

  // Hairline verticals on the same 4-column rhythm as the site's GridLines.
  const cols = [0.2, 0.4, 0.6, 0.8]
    .map((f) => `<line x1="${w * f}" y1="0" x2="${w * f}" y2="${h}" stroke="${LINE}" stroke-width="1"/>`)
    .join('')

  const cx = w / 2
  const blockTop = h / 2 - (markSize + gap + 96) / 2
  const titleY = blockTop + markSize + gap + 62
  const ruleY = titleY + 34
  const taglineY = ruleY + 40

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${CANVAS}"/>
    ${cols}
    <text x="${cx}" y="${titleY}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-size="82"
          fill="${INK}" letter-spacing="-1.5">${title}</text>
    <line x1="${cx - 34}" y1="${ruleY}" x2="${cx + 34}" y2="${ruleY}" stroke="${OLIVE}" stroke-width="2"/>
    <text x="${cx}" y="${taglineY}" text-anchor="middle"
          font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="25"
          fill="${INK_SOFT}" letter-spacing="0.3">${tagline}</text>
  </svg>`)

  const out = path.join(outDir, name)
  await sharp(svg)
    .composite([{ input: markPng, top: Math.round(blockTop), left: Math.round(cx - markSize / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(out)
  return out
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const written = []

  // Transparent-background marks (the tile carries its own olive ground).
  for (const { size } of AVATAR_SIZES) {
    written.push(
      await render(path.join(brandDir, 'veyl-mark.svg'), path.join(outDir, `veyl-mark-${size}.png`), size),
    )
  }

  // Glyph only, transparent - for dark or custom backgrounds.
  for (const size of [256, 512, 1024]) {
    written.push(
      await render(
        path.join(brandDir, 'veyl-glyph.svg'),
        path.join(outDir, `veyl-glyph-${size}.png`),
        size,
      ),
    )
  }

  // Banners.
  written.push(
    await banner({
      w: 1200,
      h: 630,
      name: 'veyl-og-1200x630.png',
      title: 'Veyl',
      tagline: 'Confidential settlement for tokenized equities',
      markSize: 132,
      gap: 34,
    }),
  )
  // X headers crop hard top and bottom; keep the block tight and centred.
  written.push(
    await banner({
      w: 1500,
      h: 500,
      name: 'veyl-x-header-1500x500.png',
      title: 'Veyl',
      tagline: 'Encrypted balances. Private transfers. Onchain settlement.',
      markSize: 104,
      gap: 24,
    }),
  )

  // Maskable PWA icon needs the glyph inside the safe zone, so the tile is
  // padded rather than bleeding to the edge.
  const padded = Math.round(512 * 0.62)
  const inner = await sharp(await readFile(path.join(brandDir, 'veyl-mark.svg')), { density: 384 })
    .resize(padded, padded)
    .png()
    .toBuffer()
  const maskable = path.join(outDir, 'veyl-maskable-512.png')
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: OLIVE },
  })
    .composite([{ input: inner, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(maskable)
  written.push(maskable)

  for (const f of written) console.log('  ' + path.relative(root, f).replace(/\\/g, '/'))
  console.log(`\n${written.length} files written to public/brand/png/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
