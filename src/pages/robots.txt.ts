import type { APIContext } from 'astro';
import { SITE } from '../consts';

export function GET(context: APIContext) {
  const origin = context.site ?? new URL(SITE.url);
  const sitemap = new URL('sitemap-index.xml', origin);

  const body = [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${sitemap.href}`, ``].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
