import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const site = process.env.SITE_URL ?? 'https://antique.keyboardwarrior.top';

function getContentLastmods() {
  const lastmods = new Map();

  for (const collection of ['journal', 'notes']) {
    const directory = join(process.cwd(), 'src', 'content', collection);
    if (!existsSync(directory)) continue;

    for (const file of readdirSync(directory)) {
      if (!file.endsWith('.md')) continue;

      const raw = readFileSync(join(directory, file), 'utf8');
      const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
      if (!frontmatter) continue;

      const updated = frontmatter.match(/^updated:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1];
      const published = frontmatter.match(/^date:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1];
      const value = (updated ?? published)?.trim();
      if (!value) continue;

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) continue;

      lastmods.set(`/${collection}/${file.replace(/\.md$/, '')}/`, date.toISOString());
    }
  }

  return lastmods;
}

const lastmods = getContentLastmods();

export default defineConfig({
  site,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/search') && !page.includes('/404'),
      serialize: (item) => {
        const lastmod = lastmods.get(new URL(item.url).pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'rose-pine-moon',
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
