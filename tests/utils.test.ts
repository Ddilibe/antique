import { describe, expect, it } from 'vitest';
import {
  formatDate,
  getTagCounts,
  isoDate,
  paginate,
  readingTime,
  slugify,
  sortByDateDesc,
  titleCase,
  truncate,
  wordCount,
} from '../src/lib/utils';

describe('formatDate', () => {
  it('formats a date in long form using UTC', () => {
    expect(formatDate(new Date('2026-10-18T00:00:00Z'))).toBe('October 18, 2026');
  });

  it('formats month and day only', () => {
    expect(formatDate('2026-10-18', 'month-day')).toBe('Oct 18');
  });
});

describe('isoDate', () => {
  it('returns a date-only ISO string', () => {
    expect(isoDate(new Date('2026-03-01T23:00:00Z'))).toBe('2026-03-01');
  });
});

describe('readingTime', () => {
  it('returns at least one minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('a few words')).toBe(1);
  });

  it('rounds to the nearest minute at 225 words per minute', () => {
    expect(readingTime(Array.from({ length: 450 }, () => 'word').join(' '))).toBe(2);
  });
});

describe('wordCount', () => {
  it('counts whitespace-separated words', () => {
    expect(wordCount('  one\n two\tthree  ')).toBe(3);
    expect(wordCount(undefined)).toBe(0);
  });
});

describe('slugify', () => {
  it('normalises accents, case, and punctuation', () => {
    expect(slugify('Café Society & The Long Now')).toBe('cafe-society-the-long-now');
  });

  it('trims leading and trailing separators', () => {
    expect(slugify('...attention...')).toBe('attention');
  });
});

describe('titleCase', () => {
  it('capitalises hyphenated and spaced words', () => {
    expect(titleCase('slow-reading habit')).toBe('Slow Reading Habit');
  });
});

describe('sortByDateDesc', () => {
  it('sorts newest first without mutating the input', () => {
    const entries = [
      { date: new Date('2025-01-01') },
      { date: new Date('2026-01-01') },
    ];
    const sorted = sortByDateDesc(entries);
    expect(sorted[0]?.date.toISOString()).toContain('2026');
    expect(entries[0]?.date.toISOString()).toContain('2025');
  });
});

describe('getTagCounts', () => {
  it('counts tags and sorts them alphabetically', () => {
    const counts = getTagCounts([
      { tags: ['memory', 'attention'] },
      { tags: ['attention'] },
    ]);
    expect([...counts.entries()]).toEqual([
      ['attention', 2],
      ['memory', 1],
    ]);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 9 }, (_, index) => index + 1);

  it('slices the requested page', () => {
    const result = paginate(items, 2, 4);
    expect(result.items).toEqual([5, 6, 7, 8]);
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.hasPrev).toBe(true);
    expect(result.hasNext).toBe(true);
  });

  it('clamps out-of-range pages', () => {
    expect(paginate(items, 0, 4).currentPage).toBe(1);
    expect(paginate(items, 99, 4).currentPage).toBe(3);
  });

  it('handles an empty list', () => {
    const result = paginate([], 1, 4);
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });
});

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('short', 20)).toBe('short');
  });

  it('cuts at a word boundary and adds an ellipsis', () => {
    expect(truncate('one two three four', 12)).toBe('one two…');
  });
});
