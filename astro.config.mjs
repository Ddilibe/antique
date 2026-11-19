import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';


const site = process.env.SITE_URL ?? 'https://antique.keyboardwarrior.top';

function getContentLastmods() {
  const lastmods = new Map();

  for (const collection of ['journal', 'notes']) {
    const directory = join(process.cwd(), 'src', 'content', collection);
    if (!existsSync(directory)) continue;

    const visit = (currentDirectory) => {
      for (const entry of readdirSync(currentDirectory, { withFileTypes: true })) {
        const path = join(currentDirectory, entry.name);

        if (entry.isDirectory()) {
          visit(path);
          continue;
        }

        if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

        const raw = readFileSync(path, 'utf8');
        const frontmatter = raw.replace(/^\s+/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
        if (!frontmatter) continue;

        const updated = frontmatter.match(/^updated:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1];
        const published = frontmatter.match(/^date:\s*['"]?([^'"\n]+)['"]?\s*$/m)?.[1];
        const value = (updated ?? published)?.trim();
        if (!value) continue;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) continue;

        const slug = relative(directory, path)
          .replace(/\.md$/, '')
          .split(sep)
          .join('/');
        lastmods.set(`/${collection}/${slug}/`, date.toISOString());
      }
    };

    visit(directory);
  }

  return lastmods;
}

const lastmods = getContentLastmods();

export default defineConfig({
  site,
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/search') && !page.includes('/404') && !page.includes('/page/'),
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
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
