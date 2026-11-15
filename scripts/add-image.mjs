#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const DEFAULT_DIR = 'images';
const DEFAULT_QUALITY = 82;

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
};

const SHARP_FORMATS = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  heif: 'avif',
  svg: 'svg',
  tiff: 'tiff',
};

const KNOWN_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'tiff']);

export function slugifyFilename(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function humanizeFilename(value) {
  const words = value.replace(/[-_]+/g, ' ').trim();
  if (!words) return 'Image';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function extensionOf(value) {
  return path.extname(value).replace(/^\./, '').toLowerCase();
}

export function stripExtension(value) {
  return path.basename(value, path.extname(value));
}

export function normalizeDirectory(value) {
  const cleaned = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const segments = cleaned.split('/').filter((segment) => segment && segment !== '.');
  if (!cleaned || segments.some((segment) => segment === '..')) {
    throw new Error('--dir must be a relative directory inside public/');
  }
  return segments.join('/');
}

export function buildMarkdown(imagePath, alt) {
  return `![${alt.replace(/([\\\]])/g, '\\$1')}](${imagePath})`;
}

export function buildFigure(imagePath, alt, caption = alt) {
  const escapeHtml = (value) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const figcaption = caption ? `\n  <figcaption>${escapeHtml(caption)}</figcaption>` : '';
  return `<figure>\n  <img src="${imagePath}" alt="${escapeHtml(alt)}" loading="lazy" />${figcaption}\n</figure>`;
}

function parseArgs(argv) {
  const options = {
    alt: '',
    caption: '',
    name: '',
    dir: DEFAULT_DIR,
    width: 0,
    quality: DEFAULT_QUALITY,
    cover: false,
    figure: false,
    force: false,
    help: false,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith('-')) {
      positional.push(raw);
      continue;
    }

    const [flag, inlineValue] = raw.includes('=') ? raw.split(/=(.*)/s, 2) : [raw, undefined];
    const takeValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`${flag} requires a value`);
      }
      index += 1;
      return value;
    };

    switch (flag) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '--alt':
        options.alt = takeValue();
        break;
      case '--caption':
        options.caption = takeValue();
        break;
      case '--name':
        options.name = takeValue();
        break;
      case '--dir':
        options.dir = takeValue();
        break;
      case '--width':
        options.width = Number.parseInt(takeValue(), 10);
        break;
      case '--quality':
        options.quality = Number.parseInt(takeValue(), 10);
        break;
      case '--cover':
        options.cover = true;
        break;
      case '--figure':
        options.figure = true;
        break;
      case '--force':
        options.force = true;
        break;
      default:
        throw new Error(`Unknown option: ${flag}`);
    }
  }

  if (options.width && (!Number.isInteger(options.width) || options.width <= 0)) {
    throw new Error('--width must be a positive integer');
  }
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error('--quality must be an integer between 1 and 100');
  }

  return { options, source: positional[0], extra: positional.slice(1) };
}

function printUsage() {
  console.log(`Add an image to public/ and print the markup to paste into a post.

Usage:
  npm run image -- <remote-url | local-file> [options]

Options:
  --alt <text>        Alt text for accessibility (defaults to the file name)
  --caption <text>    Caption used with --figure (defaults to the alt text)
  --name <filename>   Rename the saved file (extension optional)
  --dir <folder>      Subfolder inside public/ (default: images)
  --width <px>        Resize wide images (ignored for SVG/GIF)
  --quality <1-100>   Compression quality for resizing (default: 82)
  --figure            Print a <figure> block instead of markdown
  --cover             Also print journal frontmatter for the cover image
  --force             Overwrite an existing file instead of renaming
  -h, --help          Show this help

Examples:
  npm run image -- https://example.com/photo.jpg --alt "A misty harbour"
  npm run image -- ~/Downloads/photo.png --name winter-light --width 1600
  npm run image -- ~/Downloads/cover.jpg --cover --alt "Snow on the sill"
`);
}

async function resolveSource(source) {
  if (/^https?:\/\//i.test(source)) {
    const url = new URL(source);
    const response = await fetch(url, {
      headers: { 'user-agent': 'Antique image fetcher' },
      redirect: 'follow',
    });
    if (!response.ok) {
      throw new Error(`${source} returned ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    if (contentType && !contentType.startsWith('image/')) {
      throw new Error(`Remote file is not an image (content-type: ${contentType})`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const urlName = decodeURIComponent(path.posix.basename(url.pathname)) || 'image';
    return { buffer, originalName: urlName, contentType };
  }

  const localPath = path.resolve(ROOT, source);
  const info = await stat(localPath).catch(() => null);
  if (!info?.isFile()) {
    throw new Error(`Local file not found: ${source}`);
  }
  return { buffer: await readFile(localPath), originalName: path.basename(localPath) };
}

async function detectExtension(buffer) {
  const metadata = await sharp(buffer, { animated: true }).metadata().catch(() => null);
  if (!metadata?.format) return '';
  return SHARP_FORMATS[metadata.format] ?? '';
}

async function resolveFilename(options, originalName, contentType, buffer) {
  const requestedName = options.name || originalName;
  const requestedExtension = extensionOf(requestedName);
  let extension = KNOWN_EXTENSIONS.has(requestedExtension)
    ? requestedExtension.replace('jpeg', 'jpg')
    : '';

  if (!extension && contentType) {
    extension = MIME_EXTENSIONS[contentType] ?? '';
  }
  if (!extension) {
    extension = (await detectExtension(buffer)) || '';
  }
  if (!extension) {
    throw new Error('Could not determine the image format. Pass --name with an extension.');
  }

  const stem =
    slugifyFilename(stripExtension(requestedName)) || `image-${Date.now().toString(36)}`;
  return `${stem}.${extension}`;
}

async function uniqueFilename(directory, filename, force) {
  if (force) return filename;

  const extension = path.extname(filename);
  const stem = filename.slice(0, -extension.length);
  let candidate = filename;
  let counter = 1;
  while (existsSync(path.join(directory, candidate))) {
    candidate = `${stem}-${counter}${extension}`;
    counter += 1;
  }
  return candidate;
}

async function optimize(buffer, extension, options) {
  if (!options.width || extension === 'svg' || extension === 'gif') {
    return buffer;
  }

  const format = extension === 'jpg' ? 'jpeg' : extension;
  let pipeline = sharp(buffer, { animated: true })
    .rotate()
    .resize({ width: options.width, withoutEnlargement: true });

  if (['jpeg', 'webp', 'avif'].includes(format)) {
    pipeline = pipeline.toFormat(format, { quality: options.quality });
  } else {
    pipeline = pipeline.toFormat(format);
  }

  return pipeline.toBuffer();
}

async function main() {
  const { options, source, extra } = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }
  if (!source) {
    printUsage();
    throw new Error('Provide a remote URL or a local file path.');
  }
  if (extra.length > 0) {
    throw new Error(`Unexpected extra argument: ${extra[0]}`);
  }

  const directory = normalizeDirectory(options.dir);
  const outputDirectory = path.join(PUBLIC_DIR, directory);
  if (!outputDirectory.startsWith(`${PUBLIC_DIR}${path.sep}`) && outputDirectory !== PUBLIC_DIR) {
    throw new Error('Refusing to write outside public/');
  }

  const { buffer, originalName, contentType } = await resolveSource(source);
  const filename = await resolveFilename(options, originalName, contentType, buffer);
  const extension = extensionOf(filename);
  const output = await optimize(buffer, extension, options);

  await mkdir(outputDirectory, { recursive: true });
  const finalName = await uniqueFilename(outputDirectory, filename, options.force);
  await writeFile(path.join(outputDirectory, finalName), output);

  const publicPath = `/${directory}/${finalName}`;
  const alt = options.alt.trim() || humanizeFilename(stripExtension(finalName));
  const caption = options.caption.trim();

  console.log(`\nSaved ${publicPath}`);
  console.log(`  public/${directory}/${finalName} (${(output.length / 1024).toFixed(1)} kB)`);
  console.log('\nMarkdown:');
  console.log(`  ${buildMarkdown(publicPath, alt)}`);

  if (options.figure || caption) {
    console.log('\nFigure:');
    console.log(buildFigure(publicPath, alt, caption || alt));
  }

  if (options.cover) {
    console.log('\nJournal frontmatter:');
    console.log(`  cover: ${publicPath}`);
    console.log(`  coverAlt: ${JSON.stringify(alt)}`);
  }
}

const entrypoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === entrypoint) {
  main().catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exitCode = 1;
  });
}
