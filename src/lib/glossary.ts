// Correspondence Glossary accessor — ported from open777Native, with the
// synchronous require() replaced by a lazy async import (the JSON is ~2.3 MB,
// so it loads on first Glossary use and lands in its own chunk).

export type GlossaryStatus = 'complete' | 'stub';
export type Lens = 'esoteric' | 'scientific' | 'mythic' | 'historical' | 'etymological';

export interface GlossaryEntry {
  slug: string;
  term: string;
  displayTerm: string;
  type: string;
  aliases: string[];
  summary: string;
  lenses: Lens[];
  description: string;
  caution: string;
  status: GlossaryStatus;
  visualValue: number;
  occurrences: number;
  tables: string[];
  scalePositions: string[];
  sources: string[];
}

let Glossary: Record<string, GlossaryEntry> = {};
export let GlossaryMeta: Record<string, unknown> = {};
let aliasIndex: Record<string, string> = {};
let _allEntries: GlossaryEntry[] | null = null;
let loaded = false;
let loading: Promise<void> | null = null;

const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function loadGlossary(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = import('../data/correspondenceGlossary.json').then((mod) => {
      const data = (mod.default ?? mod) as { _meta: Record<string, unknown>; entries: Record<string, GlossaryEntry> };
      Glossary = data.entries;
      GlossaryMeta = data._meta;
      aliasIndex = {};
      for (const [slug, e] of Object.entries(Glossary)) {
        aliasIndex[norm(e.term)] = slug;
        aliasIndex[norm(e.displayTerm)] = slug;
        for (const a of e.aliases) aliasIndex[norm(a)] = slug;
      }
      loaded = true;
    });
  }
  return loading;
}

export function glossaryReady(): boolean {
  return loaded;
}

/** Look up a glossary entry by slug, term, alias, or raw cell text. */
export function lookupTerm(text: string): GlossaryEntry | undefined {
  if (!text || !loaded) return undefined;
  const s = norm(text);
  if (Glossary[s]) return Glossary[s];
  const viaAlias = aliasIndex[s];
  return viaAlias ? Glossary[viaAlias] : undefined;
}

/** Split a grid cell into individual terms (commas, brackets, newlines). Pure. */
export function splitCellTerms(cell: string): string[] {
  if (!cell) return [];
  return cell
    .replace(/[[\]()]/g, ',')
    .split(/[,;]|\r?\n|\sand\s|\/| or /)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Expand a grid cell into its glossary entries (tap-to-expand UI). */
export function expandCell(cell: string): GlossaryEntry[] {
  return splitCellTerms(cell)
    .map(lookupTerm)
    .filter((e): e is GlossaryEntry => !!e);
}

/** Every entry: complete before stubs, then alphabetical by display term. */
export function allEntries(): GlossaryEntry[] {
  if (!loaded) return [];
  if (_allEntries) return _allEntries;
  _allEntries = Object.values(Glossary).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'complete' ? -1 : 1;
    return (a.displayTerm || a.term).localeCompare(b.displayTerm || b.term);
  });
  return _allEntries;
}

export const getEntry = (slug: string): GlossaryEntry | undefined => Glossary[slug];

export function entriesByType(): Record<string, GlossaryEntry[]> {
  const out: Record<string, GlossaryEntry[]> = {};
  for (const e of allEntries()) (out[e.type] ||= []).push(e);
  return out;
}

/** Free-text search across term, aliases, and summary. */
export function searchEntries(query: string): GlossaryEntry[] {
  const q = norm(query);
  if (!q) return allEntries();
  const raw = query.trim().toLowerCase();
  const scored: { e: GlossaryEntry; score: number }[] = [];
  for (const e of allEntries()) {
    const term = (e.term || '').toLowerCase();
    const display = (e.displayTerm || '').toLowerCase();
    let score = 0;
    if (e.slug === q || norm(e.term) === q) score = 100;
    else if (term.startsWith(raw) || display.startsWith(raw)) score = 80;
    else if (term.includes(raw) || display.includes(raw)) score = 60;
    else if (e.aliases.some((a) => a.toLowerCase().includes(raw))) score = 40;
    else if ((e.summary || '').toLowerCase().includes(raw)) score = 20;
    if (!score) continue;
    if (e.status === 'complete') score += 5;
    scored.push({ e, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || (a.e.displayTerm || a.e.term).localeCompare(b.e.displayTerm || b.e.term))
    .map((s) => s.e);
}

/** Entries whose provenance includes a given table label (row's `index`). */
export function entriesForRow(rowLabel: string): GlossaryEntry[] {
  if (!rowLabel || !loaded) return [];
  return allEntries().filter((e) => e.tables.includes(rowLabel));
}
