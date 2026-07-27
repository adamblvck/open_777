// Path detail — grouping + header helpers. Ported from open777Native.
// Turns one Liber 777 column (path/sephira) into reading groups, and resolves
// the header identity. Pure data — no React.
import { Liber777 } from '../constants/liber_777';
import { pathsData } from './pathsData';
import { getCategoryByRow, type CategoryEntry } from './categoryGlossary';

type Row = Record<string, string> & { index: string };
const ROWS = Liber777 as unknown as Row[];

export type CorrespondenceValueType = 'text' | 'hebrew' | 'color' | 'number';

export interface PathRow {
  rowIdx: number;
  label: string;
  rawLabel: string;
  value: string;
  valueType: CorrespondenceValueType;
  colorHex?: string;
  category?: CategoryEntry;
}

type GroupId = 'essence' | 'colour' | 'hebrew' | 'arsenal' | 'deities' | 'other';

export interface PathGroup {
  id: GroupId;
  title: string;
  rows: PathRow[];
}

const GROUP_ORDER: GroupId[] = ['essence', 'colour', 'hebrew', 'arsenal', 'deities', 'other'];
const GROUP_TITLES: Record<GroupId, string> = {
  essence: 'Essence',
  colour: 'Colour scales',
  hebrew: 'Hebrew & the heavens',
  arsenal: 'Magical arsenal',
  deities: 'Deities & demons',
  other: 'Other correspondences',
};

const HEADER_ROWS = new Set<number>([0, 1]);
const ESSENCE_TYPES = new Set(['tarot-trump', 'planet', 'sephira', 'path-meaning', 'letter', 'element', 'zodiac']);
const HEBREW_TYPES = new Set(['god-name', 'world', 'translit', 'angel']);
const ARSENAL_TYPES = new Set(['weapon', 'perfume', 'plant', 'animal', 'gemstone', 'magical-power', 'drug', 'geomancy', 'metal', 'incense']);

function groupForCategory(cat?: CategoryEntry): GroupId {
  const kind = cat?.kind || '';
  const type = cat?.type || '';
  if (kind.startsWith('color')) return 'colour';
  if (kind === 'number') return 'hebrew';
  if (ESSENCE_TYPES.has(type)) return 'essence';
  if (HEBREW_TYPES.has(type)) return 'hebrew';
  if (ARSENAL_TYPES.has(type)) return 'arsenal';
  if (type.startsWith('deity-') || type === 'demon') return 'deities';
  return 'other';
}

const HEBREW_RE = /[֐-׿]/;
const HEX_RE = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i;

function detectValueType(value: string, cat?: CategoryEntry): CorrespondenceValueType {
  if (cat?.kind?.startsWith('color')) return 'color';
  if (HEBREW_RE.test(value)) return 'hebrew';
  if (cat?.kind === 'number' || /^\s*\d+\s*$/.test(value)) return 'number';
  return 'text';
}

function cleanLabel(raw: string): string {
  return raw.replace(/^\s*[\dIVXLCDM]+(\s*bis)?\.?\s*/i, '').trim() || raw;
}

function normalizeHex(v: string): string | undefined {
  const t = v.trim();
  if (!HEX_RE.test(t)) return undefined;
  return t.startsWith('#') ? t : `#${t}`;
}

const isEmpty = (v: unknown) => !v || (typeof v === 'string' && (v.trim() === '' || v.trim() === '...'));

/** Build the grouped correspondences for one column (path/sephira). */
export function buildPathGroups(columnIndex: number): PathGroup[] {
  const col = String(columnIndex);
  const buckets: Record<GroupId, PathRow[]> = { essence: [], colour: [], hebrew: [], arsenal: [], deities: [], other: [] };

  ROWS.forEach((row, rowIdx) => {
    if (HEADER_ROWS.has(rowIdx)) return;
    const value = row?.[col];
    if (isEmpty(value)) return;

    const cat = getCategoryByRow(rowIdx);
    if (cat?.kind === 'color-hex') return; // folded into the preceding color-name row

    const valueType = detectValueType(String(value), cat);
    let colorHex: string | undefined;
    if (valueType === 'color') {
      colorHex = normalizeHex(String(value));
      if (!colorHex) {
        const next = getCategoryByRow(rowIdx + 1);
        if (next?.kind === 'color-hex') colorHex = normalizeHex(String(ROWS[rowIdx + 1]?.[col] || ''));
      }
    }

    buckets[groupForCategory(cat)].push({
      rowIdx,
      label: cleanLabel(String(row.index || '')),
      rawLabel: String(row.index || ''),
      value: String(value),
      valueType,
      colorHex,
      category: cat,
    });
  });

  return GROUP_ORDER.map((id) => ({ id, title: GROUP_TITLES[id], rows: buckets[id] })).filter((g) => g.rows.length > 0);
}

// --- Header identity ---
const PLANET_GLYPHS: Record<string, string> = { sol: '☉', sun: '☉', luna: '☽', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄' };
const ZODIAC_GLYPHS: Record<string, string> = { aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋', leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏', sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓' };
const ELEMENT_GLYPHS: Record<string, string> = { fire: '🜂', water: '🜄', air: '🜁', earth: '🜃', spirit: '🜀' };

function glyphForWord(word: string): string | undefined {
  const w = word.trim().toLowerCase();
  return PLANET_GLYPHS[w] || ZODIAC_GLYPHS[w] || ELEMENT_GLYPHS[w];
}

function findHeaderGlyph(columnIndex: number): string | undefined {
  const col = String(columnIndex);
  for (let rowIdx = 0; rowIdx < ROWS.length; rowIdx++) {
    const value = ROWS[rowIdx]?.[col];
    if (isEmpty(value)) continue;
    const raw = String(value).trim();
    const direct = glyphForWord(raw);
    if (direct) return direct;
    const firstToken = raw.split(/[\s,()/]/)[0];
    const viaToken = glyphForWord(firstToken);
    if (viaToken) return viaToken;
  }
  return undefined;
}

export interface PathHeaderMeta {
  name: string;
  hebrewLetter: string;
  subtitle: string;
  glyph?: string;
}

export function getPathHeaderMeta(columnIndex: number): PathHeaderMeta {
  const meta = pathsData[String(columnIndex)];
  const name = String(ROWS[1]?.[String(columnIndex)] || '').trim() || meta?.title || `Path ${columnIndex}`;
  const hebrewLetter = String(ROWS[0]?.[String(columnIndex)] || '').trim();
  const subtitle = [meta?.name, meta?.title].filter(Boolean).join(' · ');
  return { name, hebrewLetter, subtitle, glyph: findHeaderGlyph(columnIndex) };
}
