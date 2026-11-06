import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'og');
const logoPath = path.join(root, 'public', 'logo.svg');
const outputPath = path.join(outputDir, 'default.png');

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const logo = await readFile(logoPath, 'utf8');
const logoData = `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`;

const titleLines = ['A quiet place', 'for loud thoughts.'];
const title = titleLines
  .map(
    (line, index) =>
      `<text x="80" y="${318 + index * 96}" font-family="DejaVu Serif, Georgia, serif" font-size="88" fill="#211d17" letter-spacing="-2">${escapeXml(line)}</text>`,
  )
  .join('\n    ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="warmth" cx="18%" cy="8%" r="82%">
      <stop offset="0%" stop-color="#e8d8bb" stop-opacity="0.85" />
      <stop offset="52%" stop-color="#f2ecdf" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="warmth2" cx="92%" cy="92%" r="70%">
      <stop offset="0%" stop-color="#e4d6bf" stop-opacity="0.7" />
      <stop offset="60%" stop-color="#f2ecdf" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#f2ecdf" />
  <rect width="1200" height="630" fill="url(#warmth)" />
  <rect width="1200" height="630" fill="url(#warmth2)" />
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#d6c9b4" stroke-width="1" />

  <image href="${logoData}" x="80" y="78" width="58" height="58" />
  <text x="156" y="120" font-family="DejaVu Serif, Georgia, serif" font-size="38" fill="#211d17" letter-spacing="1">Antique</text>

  ${title}

  <line x1="80" y1="500" x2="1120" y2="500" stroke="#d6c9b4" stroke-width="1" />
  <text x="80" y="544" font-family="DejaVu Sans Mono, monospace" font-size="17" fill="#7c7263" letter-spacing="4">ISSUE 07 — WINTER 2026</text>
  <text x="1120" y="544" text-anchor="end" font-family="DejaVu Sans Mono, monospace" font-size="17" fill="#7c7263" letter-spacing="4">JOURNAL &amp; INDEPENDENT PUBLICATION</text>
  <text x="80" y="576" font-family="DejaVu Sans Mono, monospace" font-size="15" fill="#9a7b4d" letter-spacing="2">ESSAYS · NOTES · MARGINALIA</text>
</svg>`;

await mkdir(outputDir, { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outputPath);

console.log(`Wrote ${path.relative(root, outputPath)}`);
