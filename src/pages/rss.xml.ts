import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedJournal, getPublishedNotes } from '../lib/content';
import { SITE } from '../consts';
import { formatDate, truncate } from '../lib/utils';

export async function GET(context: APIContext) {
  const [journal, notes] = await Promise.all([getPublishedJournal(), getPublishedNotes()]);

  const items = [
    ...journal.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/journal/${entry.id}/`,
      categories: entry.data.tags,
    })),
    ...notes.map((entry) => ({
      title: entry.data.title ?? `Note — ${formatDate(entry.data.date)}`,
      description: truncate((entry.body ?? '').replace(/\s+/g, ' ').trim(), 240),
      pubDate: entry.data.date,
      link: `/notes/${entry.id}/`,
      categories: entry.data.tags,
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: `<language>en-us</language><copyright>© ${new Date().getFullYear()} ${SITE.name}</copyright>`,
  });
}
