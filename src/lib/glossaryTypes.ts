// Per-type presentation metadata for the glossary (label + accent color + glyph).
// Ported from open777Native/constants/glossaryTypes.ts, with Expo Ionicons
// replaced by Unicode glyphs (the color is the primary differentiator).

export interface TypeMeta {
  label: string;
  color: string;
  glyph: string;
}

export const TYPE_META: Record<string, TypeMeta> = {
  concept: { label: 'Concept', color: '#8B5CF6', glyph: '✦' },
  'deity-egyptian': { label: 'Egyptian Deity', color: '#D4A017', glyph: '☥' },
  angel: { label: 'Angel', color: '#60A5FA', glyph: '✶' },
  'soul-part': { label: 'Part of the Soul', color: '#34D399', glyph: '❂' },
  'tarot-trump': { label: 'Tarot Trump', color: '#F59E0B', glyph: '◈' },
  'magical-image': { label: 'Magical Image', color: '#A78BFA', glyph: '❖' },
  'deity-buddhist': { label: 'Buddhist Deity', color: '#FB923C', glyph: '☸' },
  'magical-power': { label: 'Magical Power', color: '#F472B6', glyph: '✺' },
  world: { label: 'World / Heaven / Hell', color: '#38BDF8', glyph: '◉' },
  animal: { label: 'Animal', color: '#84CC16', glyph: '❧' },
  zodiac: { label: 'Zodiac Sign', color: '#FBBF24', glyph: '★' },
  plant: { label: 'Plant', color: '#22C55E', glyph: '❀' },
  perfume: { label: 'Perfume / Incense', color: '#C084FC', glyph: '❁' },
  weapon: { label: 'Magical Weapon', color: '#94A3B8', glyph: '⚔' },
  'deity-hindu': { label: 'Hindu Deity', color: '#FB7185', glyph: 'ॐ' },
  planet: { label: 'Planet', color: '#FACC15', glyph: '☉' },
  'tarot-suit': { label: 'Tarot Suit', color: '#FBBF24', glyph: '◇' },
  'path-meaning': { label: 'Path Meaning', color: '#A3E635', glyph: '⌖' },
  drug: { label: 'Drug / Substance', color: '#EF4444', glyph: '☣' },
  letter: { label: 'Letter', color: '#7DD3FC', glyph: 'ℵ' },
  gemstone: { label: 'Precious Stone', color: '#2DD4BF', glyph: '◆' },
  sephira: { label: 'Sephira', color: '#C4B5FD', glyph: '⬡' },
  demon: { label: 'Demon / Qliphoth', color: '#DC2626', glyph: '⛧' },
  element: { label: 'Element', color: '#22D3EE', glyph: '△' },
  'deity-greek': { label: 'Greek Deity', color: '#E0C68A', glyph: 'Ω' },
  grade: { label: 'Grade', color: '#F0ABFC', glyph: '✪' },
  'deity-christian': { label: 'Christian Figure', color: '#FCD34D', glyph: '✝' },
  'tarot-court': { label: 'Tarot Court Card', color: '#F59E0B', glyph: '♚' },
  'deity-roman': { label: 'Roman Deity', color: '#E0C68A', glyph: '☼' },
  'deity-tao': { label: 'Taoist Figure', color: '#CBD5E1', glyph: '☯' },
  metal: { label: 'Metal', color: '#9CA3AF', glyph: '⊙' },
  'deity-norse': { label: 'Norse Deity', color: '#93C5FD', glyph: '⚒' },
  alchemy: { label: 'Alchemy', color: '#F97316', glyph: '⚗' },
  'god-name': { label: 'Divine Name', color: '#FDE68A', glyph: '✷' },
};

export const FALLBACK_TYPE_META: TypeMeta = { label: 'Term', color: '#7C3AED', glyph: '◌' };

export const getTypeMeta = (type: string): TypeMeta => TYPE_META[type] ?? FALLBACK_TYPE_META;

export interface LensMeta {
  label: string;
  color: string;
  glyph: string;
}

export const LENS_META: Record<string, LensMeta> = {
  esoteric: { label: 'Esoteric', color: '#A78BFA', glyph: '☉' },
  mythic: { label: 'Mythic', color: '#F59E0B', glyph: '✶' },
  scientific: { label: 'Scientific', color: '#22D3EE', glyph: '⚗' },
  historical: { label: 'Historical', color: '#94A3B8', glyph: '☷' },
  etymological: { label: 'Etymological', color: '#34D399', glyph: 'ℵ' },
};

export const getLensMeta = (lens: string): LensMeta => LENS_META[lens] ?? { label: lens, color: '#9CA3AF', glyph: '◦' };
