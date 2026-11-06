export const WORDS_PER_MINUTE = 225;

export function formatDate(
  date: Date | string,
  style: 'long' | 'medium' | 'short' | 'month-day' = 'long',
): string {
  const value = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    ...(style === 'long' && { year: 'numeric', month: 'long', day: 'numeric' }),
    ...(style === 'medium' && { year: 'numeric', month: 'short', day: 'numeric' }),
    ...(style === 'short' && { year: 'numeric', month: '2-digit', day: '2-digit' }),
    ...(style === 'month-day' && { month: 'short', day: 'numeric' }),
  };

  return new Intl.DateTimeFormat('en-US', options).format(value);
}

export function isoDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}

export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function wordCount(body: string | undefined): number {
  if (!body) return 0;
  return body.trim().split(/\s+/).filter(Boolean).length;
}

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleCase(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export interface Dated {
  date: Date;
}

export function sortByDateDesc<T extends Dated>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function sortByDateAsc<T extends Dated>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface Tagged {
  tags: string[];
}

export function getTagCounts(entries: Tagged[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return new Map([...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
  start: number;
  end: number;
}

export function paginate<T>(items: T[], page: number, perPage: number): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (currentPage - 1) * perPage;
  const end = Math.min(start + perPage, totalItems);

  return {
    items: items.slice(start, end),
    currentPage,
    totalPages,
    totalItems,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    start,
    end,
  };
}

export function truncate(value: string, length = 160): string {
  if (value.length <= length) return value;
  const clipped = value.slice(0, length);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : length).trimEnd()}…`;
}

export function excludeDrafts<T extends { data: { draft: boolean } }>(entries: T[]): T[] {
  return entries.filter((entry) => !entry.data.draft);
}
