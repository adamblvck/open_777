// Open 777 — "Void & Glow" design tokens (typed).
// Mirrors the CSS custom properties in index.css. Keep the two in lockstep.

export const tokens = {
  void2: '#0b0a0f',
  void: '#16141c',
  panel: '#0c0b11',
  card: '#161420',
  card2: '#1b1827',
  line: '#211e2b',
  line2: '#2a2733',
  purple: '#9d6bff',
  purpledim: '#6e5aa6',
  cream: '#f3eee4',
  muted: '#9b95aa',
  dim: '#7d7790',
  faint: '#605b6e',
  panel2: '#100e17',
  navbg: '#0a0810',
  purple2: '#c9b6ff',
  danger: '#e0464b',
  serif: "'Cormorant Garamond', Georgia, serif",
  serif2: "'EB Garamond', Georgia, serif",
  ui: "'Prompt', system-ui, sans-serif",
} as const;

export type Element = 'Air' | 'Fire' | 'Water' | 'Earth' | 'Spirit';

// Element accent colour + glyph (used by analysis, chips, library dots).
export const EL: Record<Element, { c: string; g: string }> = {
  Air: { c: '#7fb3ff', g: '△' },
  Fire: { c: '#e0464b', g: '△' },
  Water: { c: '#34c08a', g: '▽' },
  Earth: { c: '#b9a44a', g: '▽' },
  Spirit: { c: '#9d6bff', g: '✷' },
};

// King-scale curated sphere colours — node badge dot + Reference hero glow.
export const SPHERE_COLORS: Record<string, string> = {
  kether: '#f3eee4',
  chokmah: '#9aa0ab',
  binah: '#6b6478',
  chesed: '#4a7fff',
  geburah: '#e0464b',
  tiphareth: '#fcbd3f',
  netzach: '#34c08a',
  hod: '#ff8a3d',
  yesod: '#9d6bff',
  malkuth: '#b9a44a',
};

// Suggested-sphere fallback by dominant element (scrying analysis pipeline).
export const elemDefault: Record<Element, string> = {
  Air: 'hod',
  Fire: 'geburah',
  Water: 'yesod',
  Earth: 'malkuth',
  Spirit: 'tiphareth',
};

// The one place the palette goes wide: the Ask QueQue conversational dot.
export const RAINBOW =
  'linear-gradient(90deg,#ff6b6b,#ffd166,#6bffb0,#6bb8ff,#b86bff,#ff6bd6,#ff6b6b)';
