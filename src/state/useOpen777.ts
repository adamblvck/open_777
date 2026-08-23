// Central store for the Open 777 workstation (Zustand + persist).
// Mirrors the desktop prototype's flat state object and imperative methods.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runAnalysis, exportMd, SAMPLE_TRANSCRIPT } from '../lib/analysis';
import { retrieve } from '../lib/retrieval';
import { findEntry } from '../data/referenceAdapter';
import { sessionsDefault } from '../data/sessions';
import { usePrefs } from './usePrefs';
import type { Category, ChatMsg, Reading, Script, Session } from '../data/models';

export type Mode =
  | 'reference'
  | 'gematria'
  | 'scrying'
  | 'queque'
  | 'grid'
  | 'texts'
  | 'glossary'
  | 'journey'
  | 'myrecords'
  | 'tree'
  | 'search';

const GREETING =
  'You have been here before. Ask me anything that lives in your library — a feeling, a name, a thread you keep returning to — and I will gather what resonates.';

const SCRIPT_SEED: Record<Script, string> = { he: 'אהבה', gr: 'αγαπη', en: 'LIGHT' };

interface State {
  mode: Mode;
  // reference
  query: string;
  category: Category;
  selectedId: string;
  meanings: Record<string, string>; // PERSISTED
  meaningDraft: string;
  // gematria
  gemInput: string;
  gemScript: Script;
  // scrying
  sessions: Session[]; // PERSISTED
  activeSession: string | null;
  scryText: string;
  recording: boolean;
  recTime: number;
  analysis: Reading | null;
  // queque
  chat: ChatMsg[];
  chatInput: string;
  lastQuery: string;
  // glossary / card navigation
  selectedGlossarySlug: string;
  selectedCardColumn: number | null;
  selectedRecordingId: string;
  /**
   * Bumped whenever a recording's metadata changes outside the browse list —
   * re-filing a path, say. The list hook keeps its own state per instance, so
   * this counter is what tells it to refetch.
   */
  recordsVersion: number;
  /** Path currently focused on the Tree map, or null for none. */
  treePath: number | null;
  /** Query carried into the search mode (from a motif chip, a 777 row…). */
  searchQuery: string;
  searchScope: string;
  // journey
  journeyScreen: 'map' | 'ritual' | 'witness' | 'hexagram';
  journeyPath: number | null;
  // global
  toast: string;

  // actions
  setMode: (m: Mode) => void;
  setQuery: (q: string) => void;
  setCategory: (c: Category) => void;
  selectEntry: (id: string) => void;
  setMeaningDraft: (v: string) => void;
  saveMeaning: () => void;
  carryToScry: () => void;
  setGemInput: (v: string) => void;
  setGemScript: (s: Script) => void;
  loadSession: (id: string) => void;
  setScryText: (v: string) => void;
  toggleRec: () => void;
  uploadAudio: (name: string) => void;
  transcribe: () => void;
  analyze: () => void;
  copySummary: () => void;
  exportReading: () => void;
  saveSession: () => void;
  setChatInput: (v: string) => void;
  sendChat: (q?: string) => void;
  flash: (msg: string) => void;
  jumpToReference: (id: string) => void;
  openGlossaryEntry: (slug: string) => void;
  openCard: (column: number) => void;
  setJourneyScreen: (screen: 'map' | 'ritual' | 'witness' | 'hexagram', path?: number | null) => void;
  setSelectedRecording: (id: string) => void;
  /** Tell the records list its data is stale. */
  invalidateRecords: () => void;
  setTreePath: (n: number | null) => void;
  /** Jump into search with a query already applied. */
  searchFor: (q: string, scope?: string) => void;
}

let recTimer: ReturnType<typeof setInterval> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

function copyText(t: string) {
  try {
    navigator.clipboard.writeText(t);
  } catch {
    /* clipboard unavailable */
  }
}

const catOf = (type: string): Category =>
  type === 'sphere' ? 'spheres' : type === 'path' ? 'paths' : type === 'planet' ? 'planets' : 'zodiac';

export const useOpen777 = create<State>()(
  persist(
    (set, get) => ({
      mode: 'reference',
      query: '',
      category: 'spheres',
      selectedId: 'kether',
      meanings: {},
      meaningDraft: '',
      gemInput: 'אהבה',
      gemScript: 'he',
      sessions: sessionsDefault,
      activeSession: null,
      scryText: '',
      recording: false,
      recTime: 0,
      analysis: null,
      chat: [{ role: 'queque', text: GREETING }],
      chatInput: '',
      lastQuery: '',
      selectedGlossarySlug: '',
      selectedCardColumn: null,
      selectedRecordingId: '',
      recordsVersion: 0,
      treePath: null,
      searchQuery: '',
      searchScope: 'all',
      journeyScreen: 'map',
      journeyPath: null,
      toast: '',

      setMode: (mode) => set({ mode }),
      setQuery: (query) => set({ query }),
      setCategory: (category) => set({ category }),

      selectEntry: (id) => set({ selectedId: id, meaningDraft: get().meanings[id] || '' }),
      setMeaningDraft: (meaningDraft) => set({ meaningDraft }),
      saveMeaning: () => {
        const { selectedId, meaningDraft, meanings } = get();
        set({ meanings: { ...meanings, [selectedId]: meaningDraft } });
        get().flash('Meaning saved for ' + findEntry(selectedId).title + '.');
      },
      carryToScry: () => {
        const { selectedId, meaningDraft, scryText } = get();
        const name = findEntry(selectedId).title;
        set({
          mode: 'scrying',
          scryText: (scryText ? scryText + '\n\n' : '') + 'On ' + name + ' — ' + meaningDraft,
        });
        get().flash('Carried into the scrying chamber.');
      },

      setGemInput: (gemInput) => set({ gemInput }),
      setGemScript: (gemScript) => set({ gemScript, gemInput: SCRIPT_SEED[gemScript] }),

      loadSession: (id) => {
        const s = get().sessions.find((x) => x.id === id);
        if (!s) return;
        set({ scryText: s.text || 'Loaded session: ' + s.title + '. ', analysis: null, activeSession: id });
      },
      setScryText: (scryText) => set({ scryText, analysis: null }),
      toggleRec: () => {
        if (get().recording) {
          if (recTimer) clearInterval(recTimer);
          const t = get().recTime;
          set({ recording: false });
          get().flash('Recording captured — ' + t + 's. Transcribe to continue.');
        } else {
          set({ recording: true, recTime: 0 });
          recTimer = setInterval(() => set((s) => ({ recTime: s.recTime + 1 })), 1000);
        }
      },
      uploadAudio: (name) => get().flash('Uploaded "' + name + '". Transcribe to run the pipeline.'),
      transcribe: () => {
        const { scryText } = get();
        set({ scryText: (scryText ? scryText + '\n\n' : '') + SAMPLE_TRANSCRIPT, analysis: null });
        get().flash('Transcribed. Edit freely, then run the analysis.');
      },
      analyze: () => {
        const text = get().scryText.trim();
        if (!text) {
          get().flash('Write or paste something to read first.');
          return;
        }
        set({ analysis: runAnalysis(text) });
      },
      copySummary: () => {
        const a = get().analysis;
        copyText(a ? a.summary : '');
        get().flash('Summary copied to clipboard.');
      },
      exportReading: () => {
        const { analysis, scryText } = get();
        if (!analysis) return;
        copyText(exportMd(analysis, scryText));
        get().flash('Markdown copied — paste into your notes.');
      },
      saveSession: () => {
        const { analysis, scryText, sessions } = get();
        if (!analysis) {
          get().flash('Run an analysis before saving.');
          return;
        }
        const sess: Session = {
          id: 's' + Date.now(),
          title: 'Scrying — ' + analysis.sphere + ' (' + analysis.elem + ')',
          date: 'just now · ' + analysis.sphere,
          element: analysis.elem,
          text: scryText,
        };
        set({ sessions: [sess, ...sessions], activeSession: sess.id });
        get().flash('Saved to your library.');
      },

      setChatInput: (chatInput) => set({ chatInput }),
      sendChat: (q) => {
        const query = (q !== undefined ? q : get().chatInput).trim();
        if (!query) return;
        const { answer, cites } = retrieve(query);
        set((s) => ({
          chat: [...s.chat, { role: 'me', text: query }, { role: 'queque', text: answer, cites }],
          chatInput: '',
          lastQuery: query,
        }));
      },

      flash: (msg) => {
        set({ toast: msg });
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => set({ toast: '' }), 2200);
      },

      jumpToReference: (id) => {
        set({ mode: 'reference', category: catOf(findEntry(id).type) });
        get().selectEntry(id);
      },
      openGlossaryEntry: (slug) => {
        set({ mode: 'glossary', selectedGlossarySlug: slug });
        usePrefs.getState().pushRecentGlossary(slug);
      },
      openCard: (column) => set({ mode: 'reference', selectedCardColumn: column }),
      setJourneyScreen: (screen, path) =>
        set((s) => ({ journeyScreen: screen, journeyPath: path !== undefined ? path : s.journeyPath })),
      setSelectedRecording: (id) => set({ selectedRecordingId: id }),
      invalidateRecords: () => set((s) => ({ recordsVersion: s.recordsVersion + 1 })),
      setTreePath: (n) => set({ treePath: n }),
      searchFor: (q, scope) =>
        set({ searchQuery: q, searchScope: scope ?? 'all', mode: 'search' }),
    }),
    {
      name: 'open777_desktop',
      partialize: (s) => ({ meanings: s.meanings, sessions: s.sessions }),
      onRehydrateStorage: () => (state) => {
        // restore the saved meaning into the draft for the default selection
        if (state) state.meaningDraft = state.meanings[state.selectedId] || '';
      },
    }
  )
);
