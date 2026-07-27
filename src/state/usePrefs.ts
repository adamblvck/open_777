// Persisted user preferences — mirrors open777Native's preferencesSlice, plus
// journey progress and Liber highlights. Stored under its OWN localStorage key
// ('open777_prefs') so the existing 'open777_desktop' store stays untouched.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PathDetailView = 'cards' | 'twoCol' | 'table';

export interface LiberHighlight {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface PrefsState {
  // glossary
  glossaryBookmarks: string[];
  recentGlossarySlugs: string[]; // most-recent first, cap 30
  // card detail / reference
  favoriteRowIndices: number[];
  defaultOnCard: Record<number, number>;
  globalDefaultRowIdx: number | null;
  hiddenRowIndices: number[];
  pathDetailView: PathDetailView;
  favoritePathColumns: number[];
  // journey
  journeyCompleted: Record<number, boolean>;
  // texts
  liberHighlights: LiberHighlight[];

  toggleGlossaryBookmark: (slug: string) => void;
  pushRecentGlossary: (slug: string) => void;
  toggleFavoriteRow: (idx: number) => void;
  setDefaultOnCard: (col: number, rowIdx: number | null) => void;
  toggleHiddenRow: (idx: number) => void;
  setPathDetailView: (v: PathDetailView) => void;
  toggleFavoritePathColumn: (col: number) => void;
  setJourneyCompleted: (path: number, done: boolean) => void;
  addHighlight: (h: LiberHighlight) => void;
  removeHighlight: (h: LiberHighlight) => void;
}

const toggle = (arr: number[], v: number) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      glossaryBookmarks: [],
      recentGlossarySlugs: [],
      favoriteRowIndices: [],
      defaultOnCard: {},
      globalDefaultRowIdx: null,
      hiddenRowIndices: [],
      pathDetailView: 'cards',
      favoritePathColumns: [],
      journeyCompleted: {},
      liberHighlights: [],

      toggleGlossaryBookmark: (slug) =>
        set((s) => ({
          glossaryBookmarks: s.glossaryBookmarks.includes(slug)
            ? s.glossaryBookmarks.filter((x) => x !== slug)
            : [...s.glossaryBookmarks, slug],
        })),
      pushRecentGlossary: (slug) =>
        set((s) => ({ recentGlossarySlugs: [slug, ...s.recentGlossarySlugs.filter((x) => x !== slug)].slice(0, 30) })),
      toggleFavoriteRow: (idx) => set((s) => ({ favoriteRowIndices: toggle(s.favoriteRowIndices, idx) })),
      setDefaultOnCard: (col, rowIdx) =>
        set((s) => {
          const next = { ...s.defaultOnCard };
          if (rowIdx === null) delete next[col];
          else next[col] = rowIdx;
          return { defaultOnCard: next };
        }),
      toggleHiddenRow: (idx) => set((s) => ({ hiddenRowIndices: toggle(s.hiddenRowIndices, idx) })),
      setPathDetailView: (pathDetailView) => set({ pathDetailView }),
      toggleFavoritePathColumn: (col) => set((s) => ({ favoritePathColumns: toggle(s.favoritePathColumns, col) })),
      setJourneyCompleted: (path, done) =>
        set((s) => {
          const next = { ...s.journeyCompleted };
          if (done) next[path] = true;
          else delete next[path];
          return { journeyCompleted: next };
        }),
      addHighlight: (h) =>
        set((s) => ({ liberHighlights: [...s.liberHighlights.filter((x) => !(x.book === h.book && x.chapter === h.chapter && x.verse === h.verse)), h] })),
      removeHighlight: (h) =>
        set((s) => ({ liberHighlights: s.liberHighlights.filter((x) => !(x.book === h.book && x.chapter === h.chapter && x.verse === h.verse)) })),
    }),
    { name: 'open777_prefs' }
  )
);
