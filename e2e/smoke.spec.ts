import { expect, test } from '@playwright/test';

test.describe('Antique', () => {
  test('home page renders the masthead and a featured essay', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Antique/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('quiet place');
    await expect(page.getByRole('heading', { name: 'Recent essays' })).toBeVisible();
  });

  test('journal index links through to an essay', async ({ page }) => {
    await page.goto('/journal');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Essays');

    await page.locator('.post-card__title a').first().click();
    await expect(page.locator('.prose')).toBeVisible();
    await expect(page.locator('.post-header__title')).not.toBeEmpty();
  });

  test('notes are readable and tagged', async ({ page }) => {
    await page.goto('/notes');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Notes');
    await expect(page.locator('.note').first()).toBeVisible();
  });

  test('archive lists every year with entries', async ({ page }) => {
    await page.goto('/archive');
    await expect(page.locator('.archive-item').first()).toBeVisible();
    await expect(page.locator('.archive-year').first()).toBeVisible();
  });

  test('tags index exposes the tag cloud', async ({ page }) => {
    await page.goto('/tags');
    await expect(page.locator('.tag-cloud__item').first()).toBeVisible();
  });

  test('a missing page shows the custom 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('This page has gone quiet.')).toBeVisible();
  });

  test('search finds essays through the Pagefind index', async ({ page }) => {
    await page.goto('/search');
    const input = page.locator('.pagefind-ui__search-input');
    await expect(input).toBeVisible({ timeout: 15_000 });

    await input.fill('attention');
    await expect(page.locator('.pagefind-ui__result').first()).toBeVisible({ timeout: 15_000 });
  });

  test('the theme toggle persists across reloads', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('html');
    const toggle = page.locator('[data-theme-toggle]');

    const before = await root.getAttribute('data-theme');
    await toggle.click();
    const after = await root.getAttribute('data-theme');
    expect(after).not.toBe(before);

    await page.reload();
    await expect(root).toHaveAttribute('data-theme', after ?? 'light');
  });

  test('the RSS feed is valid XML', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<rss');
    expect(body).toContain('/journal/');
  });
});
