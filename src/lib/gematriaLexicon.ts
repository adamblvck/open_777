// Strong's Hebrew Lexicon match index (public domain), lazy-loaded.
// data/gematriaHebrew.json is ~825 KB — imported on first use so it lands in
// its own chunk rather than the main bundle.

export type DbEntry = { s: string; w: string; x: string; g: string; v: number };

let byValue: Map<number, DbEntry[]> | null = null;
let loading: Promise<void> | null = null;

/** Kick off (or await) loading the lexicon and indexing it by value. */
export function loadLexicon(): Promise<void> {
  if (byValue) return Promise.resolve();
  if (!loading) {
    loading = import('../data/gematriaHebrew.json').then((mod) => {
      const data = (mod.default ?? mod) as { entries: DbEntry[] };
      const map = new Map<number, DbEntry[]>();
      for (const e of data.entries) {
        const arr = map.get(e.v);
        if (arr) arr.push(e);
        else map.set(e.v, [e]);
      }
      byValue = map;
    });
  }
  return loading;
}

/** Matches for a value. Returns [] until the lexicon has loaded. */
export function matchesFor(value: number): DbEntry[] {
  if (!byValue) {
    void loadLexicon();
    return [];
  }
  return byValue.get(value) ?? [];
}

export function lexiconReady(): boolean {
  return byValue !== null;
}
