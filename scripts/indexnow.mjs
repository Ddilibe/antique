const HOST = process.env.SITE_HOST ?? 'antique.keyboardwarrior.top';
const KEY = process.env.INDEXNOW_KEY ?? '471056b3fc48b078272ba086a76a62ce';
const ORIGIN = process.env.SITE_URL ?? `https://${HOST}`;
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Antique IndexNow' },
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

async function fetchSitemapUrls() {
  const indexXml = await fetchText(`${ORIGIN}/sitemap-index.xml`);
  const sitemaps = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());

  const urls = new Set();
  for (const sitemap of sitemaps.length ? sitemaps : [`${ORIGIN}/sitemap-0.xml`]) {
    const xml = await fetchText(sitemap);
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.add(match[1].trim());
    }
  }

  return [...urls];
}

async function waitForUrls(attempts = 8) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const urls = await fetchSitemapUrls();
      if (urls.length > 0) return urls;
      throw new Error('sitemap is empty');
    } catch (error) {
      console.warn(`Attempt ${attempt}/${attempts} failed: ${error.message}`);
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 15_000));
    }
  }
}

const urlList = await waitForUrls();

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

console.log(`Submitted ${urlList.length} URLs to IndexNow: ${response.status} ${response.statusText}`);

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}
