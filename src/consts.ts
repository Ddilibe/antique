
export const SITE = {
  name: 'Antique',
  title: 'Antique ... a quiet place for loud thoughts',
  description:
    'A personal journal and independent publication. Essays, fragments, and field notes on attention, memory, and the slow work of being alive.',
  tagline: 'A quiet place for loud thoughts.',
  locale: 'en',
  email: 'franklinfidelugwuowo@gmail.com',
  author: {
    name: 'Mangino',
    bio: 'Writer, careful listener, and keeper of this small press.',
  },
  social: [
    { label: 'RSS', href: '/rss.xml', external: false },
    { label: 'Email', href: 'mailto:franklinfidelugwuowo@gmail.com', external: false },
  ],
} as const;

export const NAV = [
  { label: 'Journal', href: '/journal' },
  { label: 'Notes', href: '/notes' },
  { label: 'Archive', href: '/archive' },
  { label: 'Tags', href: '/tags' },
  { label: 'About', href: '/about' },
] as const;

export const ISSUE = {
  number: 1,
  season: 'Winter',
  year: 2026,
} as const;

export const PAGINATION = {
  journal: 8,
  notes: 12,
  archive: 24,
} as const;
