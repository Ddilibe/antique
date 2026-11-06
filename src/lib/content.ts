import { getCollection, type CollectionEntry } from 'astro:content';
import { excludeDrafts, getTagCounts, readingTime } from './utils';

export type JournalEntry = CollectionEntry<'journal'>;
export type NoteEntry = CollectionEntry<'notes'>;

function sortByDataDate<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPublishedJournal(): Promise<JournalEntry[]> {
  const entries = await getCollection('journal');
  return sortByDataDate(excludeDrafts(entries));
}

export async function getPublishedNotes(): Promise<NoteEntry[]> {
  const entries = await getCollection('notes');
  return sortByDataDate(excludeDrafts(entries));
}

export async function getFeaturedJournal(): Promise<JournalEntry | undefined> {
  const entries = await getPublishedJournal();
  return entries.find((entry) => entry.data.featured) ?? entries[0];
}

export async function getAllTags(): Promise<Map<string, number>> {
  const [journal, notes] = await Promise.all([
    getPublishedJournal(),
    getPublishedNotes(),
  ]);

  return getTagCounts([
    ...journal.map((entry) => entry.data),
    ...notes.map((entry) => entry.data),
  ]);
}

export async function getJournalByTag(tag: string): Promise<JournalEntry[]> {
  const entries = await getPublishedJournal();
  return entries.filter((entry) =>
    entry.data.tags.some((entryTag) => entryTag.toLowerCase() === tag.toLowerCase()),
  );
}

export async function getNotesByTag(tag: string): Promise<NoteEntry[]> {
  const entries = await getPublishedNotes();
  return entries.filter((entry) =>
    entry.data.tags.some((entryTag) => entryTag.toLowerCase() === tag.toLowerCase()),
  );
}

export function getRelatedJournal(
  current: JournalEntry,
  entries: JournalEntry[],
  limit = 3,
): JournalEntry[] {
  const currentTags = new Set(current.data.tags.map((tag) => tag.toLowerCase()));

  return entries
    .filter((entry) => entry.id !== current.id)
    .map((entry) => ({
      entry,
      score: entry.data.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function entryReadingTime(entry: JournalEntry | NoteEntry): number {
  return readingTime(entry.body);
}

export function entryHref(entry: JournalEntry | NoteEntry): string {
  return entry.collection === 'journal'
    ? `/journal/${entry.id}/`
    : `/notes/${entry.id}/`;
}
