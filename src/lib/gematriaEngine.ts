// Gematria engine — Hebrew + English/Latin cipher systems.
// Ported verbatim from open777Native/constants/gematria.ts (pure, dependency-free).
//
// Systems implemented:
//   Hebrew  — Standard (Mispar Hechrachi), Ordinal (Siduri), Reduced (Katan),
//             and final-letter "large" values (Gadol / Sofit).
//   English — type Latin letters → approximate phonetic transliteration to Hebrew
//             → Hebrew value, plus native Latin ciphers (Simple/Ordinal, ×6,
//             and Agrippa's Latin numeration).

export const HEBREW_RE = /[א-ת]/;

export interface HebrewLetter {
  glyph: string;
  final: boolean;
  base: string;
  name: string;
  translit: string;
  standard: number; // Mispar Hechrachi
  ordinal: number; // Mispar Siduri (1..22; finals share their base's position)
  gadol: number; // Mispar Gadol / Sofit (finals 500..900; others = standard)
}

const LETTERS: HebrewLetter[] = [
  { glyph: 'א', base: 'א', final: false, name: 'Aleph', translit: 'Aleph', standard: 1, ordinal: 1, gadol: 1 },
  { glyph: 'ב', base: 'ב', final: false, name: 'Bet', translit: 'Beth', standard: 2, ordinal: 2, gadol: 2 },
  { glyph: 'ג', base: 'ג', final: false, name: 'Gimel', translit: 'Gimel', standard: 3, ordinal: 3, gadol: 3 },
  { glyph: 'ד', base: 'ד', final: false, name: 'Dalet', translit: 'Daleth', standard: 4, ordinal: 4, gadol: 4 },
  { glyph: 'ה', base: 'ה', final: false, name: 'He', translit: 'Heh', standard: 5, ordinal: 5, gadol: 5 },
  { glyph: 'ו', base: 'ו', final: false, name: 'Vav', translit: 'Vav', standard: 6, ordinal: 6, gadol: 6 },
  { glyph: 'ז', base: 'ז', final: false, name: 'Zayin', translit: 'Zayin', standard: 7, ordinal: 7, gadol: 7 },
  { glyph: 'ח', base: 'ח', final: false, name: 'Chet', translit: 'Cheth', standard: 8, ordinal: 8, gadol: 8 },
  { glyph: 'ט', base: 'ט', final: false, name: 'Tet', translit: 'Teth', standard: 9, ordinal: 9, gadol: 9 },
  { glyph: 'י', base: 'י', final: false, name: 'Yod', translit: 'Yod', standard: 10, ordinal: 10, gadol: 10 },
  { glyph: 'כ', base: 'כ', final: false, name: 'Kaf', translit: 'Kaph', standard: 20, ordinal: 11, gadol: 20 },
  { glyph: 'ך', base: 'כ', final: true, name: 'Kaf sofit', translit: 'Kaph (final)', standard: 20, ordinal: 11, gadol: 500 },
  { glyph: 'ל', base: 'ל', final: false, name: 'Lamed', translit: 'Lamed', standard: 30, ordinal: 12, gadol: 30 },
  { glyph: 'מ', base: 'מ', final: false, name: 'Mem', translit: 'Mem', standard: 40, ordinal: 13, gadol: 40 },
  { glyph: 'ם', base: 'מ', final: true, name: 'Mem sofit', translit: 'Mem (final)', standard: 40, ordinal: 13, gadol: 600 },
  { glyph: 'נ', base: 'נ', final: false, name: 'Nun', translit: 'Nun', standard: 50, ordinal: 14, gadol: 50 },
  { glyph: 'ן', base: 'נ', final: true, name: 'Nun sofit', translit: 'Nun (final)', standard: 50, ordinal: 14, gadol: 700 },
  { glyph: 'ס', base: 'ס', final: false, name: 'Samekh', translit: 'Samekh', standard: 60, ordinal: 15, gadol: 60 },
  { glyph: 'ע', base: 'ע', final: false, name: 'Ayin', translit: 'Ayin', standard: 70, ordinal: 16, gadol: 70 },
  { glyph: 'פ', base: 'פ', final: false, name: 'Pe', translit: 'Peh', standard: 80, ordinal: 17, gadol: 80 },
  { glyph: 'ף', base: 'פ', final: true, name: 'Pe sofit', translit: 'Peh (final)', standard: 80, ordinal: 17, gadol: 800 },
  { glyph: 'צ', base: 'צ', final: false, name: 'Tsadi', translit: 'Tzaddi', standard: 90, ordinal: 18, gadol: 90 },
  { glyph: 'ץ', base: 'צ', final: true, name: 'Tsadi sofit', translit: 'Tzaddi (final)', standard: 90, ordinal: 18, gadol: 900 },
  { glyph: 'ק', base: 'ק', final: false, name: 'Qof', translit: 'Qoph', standard: 100, ordinal: 19, gadol: 100 },
  { glyph: 'ר', base: 'ר', final: false, name: 'Resh', translit: 'Resh', standard: 200, ordinal: 20, gadol: 200 },
  { glyph: 'ש', base: 'ש', final: false, name: 'Shin', translit: 'Shin', standard: 300, ordinal: 21, gadol: 300 },
  { glyph: 'ת', base: 'ת', final: false, name: 'Tav', translit: 'Tav', standard: 400, ordinal: 22, gadol: 400 },
];

const BY_GLYPH: Record<string, HebrewLetter> = Object.fromEntries(LETTERS.map((l) => [l.glyph, l]));

/** The 22 base letters in path order → Liber 777 column 11..32 (Aleph..Tav). */
export const BASE_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת';

/** Reduced (Mispar Katan) value of a single letter: strip trailing zeros (10→1, 200→2, 90→9). */
function katanOf(standard: number): number {
  let v = standard;
  while (v >= 10 && v % 10 === 0) v = v / 10;
  return v;
}

/** Keep only the 27 Hebrew letters, stripping niqqud / cantillation / punctuation. */
export function hebrewLettersOnly(input: string): string[] {
  return Array.from(input).filter((ch) => BY_GLYPH[ch] !== undefined);
}

export interface HebrewCiphers {
  standard: number;
  ordinal: number;
  reduced: number;
  gadol: number;
}

export function computeHebrewCiphers(input: string): HebrewCiphers {
  const letters = hebrewLettersOnly(input).map((g) => BY_GLYPH[g]);
  return {
    standard: letters.reduce((s, l) => s + l.standard, 0),
    ordinal: letters.reduce((s, l) => s + l.ordinal, 0),
    reduced: letters.reduce((s, l) => s + katanOf(l.standard), 0),
    gadol: letters.reduce((s, l) => s + l.gadol, 0),
  };
}

// Agrippa's "Latin" numeration. I/J and U/V/W share values.
const AGRIPPA: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 9, k: 10, l: 20, m: 30,
  n: 40, o: 50, p: 60, q: 70, r: 80, s: 90, t: 100, u: 200, v: 200, w: 200, x: 300, y: 400, z: 500,
};

export interface EnglishCiphers {
  ordinal: number; // Simple: a=1 … z=26
  sixfold: number; // ordinal × 6
  agrippa: number;
}

export function computeEnglishCiphers(input: string): EnglishCiphers {
  const chars = input.toLowerCase().replace(/[^a-z]/g, '').split('');
  let ordinal = 0;
  let agrippa = 0;
  for (const ch of chars) {
    ordinal += ch.charCodeAt(0) - 96;
    agrippa += AGRIPPA[ch] ?? 0;
  }
  return { ordinal, sixfold: ordinal * 6, agrippa };
}

const DIGRAPHS: [string, string][] = [
  ['sh', 'ש'], ['ch', 'ח'], ['kh', 'כ'], ['ts', 'צ'], ['tz', 'צ'], ['th', 'ת'], ['ph', 'פ'],
];
const SINGLES: Record<string, string> = {
  a: 'א', b: 'ב', c: 'כ', d: 'ד', e: 'ה', f: 'פ', g: 'ג', h: 'ה', i: 'י', j: 'י', k: 'כ',
  l: 'ל', m: 'מ', n: 'נ', o: 'ע', p: 'פ', q: 'ק', r: 'ר', s: 'ס', t: 'ת', u: 'ו', v: 'ו',
  w: 'ו', x: 'קס', y: 'י', z: 'ז',
};

export function transliterateToHebrew(input: string): string {
  const s = input.toLowerCase();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const pair = s.slice(i, i + 2);
    const dg = DIGRAPHS.find(([k]) => k === pair);
    if (dg) {
      out += dg[1];
      i++;
      continue;
    }
    const ch = s[i];
    if (SINGLES[ch]) out += SINGLES[ch];
  }
  return out;
}

/** Theosophical reduction: sum digits until a single digit (1–9); 0 stays 0. */
export function reduceToDigit(n: number): number {
  let v = Math.abs(n);
  while (v >= 10) {
    v = String(v).split('').reduce((s, d) => s + Number(d), 0);
  }
  return v;
}

export interface LetterValue {
  glyph: string;
  name: string;
  translit: string;
  standard: number;
}

export function letterBreakdown(hebrew: string): LetterValue[] {
  return hebrewLettersOnly(hebrew).map((g) => {
    const l = BY_GLYPH[g];
    return { glyph: l.glyph, name: l.name, translit: l.translit, standard: l.standard };
  });
}

export interface GematriaAnalysis {
  input: string;
  isHebrew: boolean;
  transliterated: boolean;
  hebrew: string;
  letters: LetterValue[];
  hebrewCiphers: HebrewCiphers;
  englishCiphers: EnglishCiphers | null;
  primaryValue: number;
}

export function analyzeGematria(rawInput: string): GematriaAnalysis {
  const input = rawInput.trim();
  const isHebrew = HEBREW_RE.test(input);
  const hebrew = isHebrew ? input : transliterateToHebrew(input);
  const transliterated = !isHebrew && hebrew.length > 0;
  const hebrewCiphers = computeHebrewCiphers(hebrew);
  const englishCiphers = isHebrew ? null : computeEnglishCiphers(input);
  return {
    input,
    isHebrew,
    transliterated,
    hebrew,
    letters: letterBreakdown(hebrew),
    hebrewCiphers,
    englishCiphers,
    primaryValue: hebrewCiphers.standard,
  };
}
