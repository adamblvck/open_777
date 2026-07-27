// Gematria / isopsephy — ported verbatim from the desktop prototype.
import type { Script } from '../data/models';

// Hebrew standard (final letters map to base values)
export const HE: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
  'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50, 'ס': 60, 'ע': 70,
  'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
};

// Hebrew ordinal (1..22, finals share)
export const HEO: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
  'כ': 11, 'ך': 11, 'ל': 12, 'מ': 13, 'ם': 13, 'נ': 14, 'ן': 14, 'ס': 15, 'ע': 16,
  'פ': 17, 'ף': 17, 'צ': 18, 'ץ': 18, 'ק': 19, 'ר': 20, 'ש': 21, 'ת': 22,
};

// Greek isopsephy
export const GR: Record<string, number> = {
  'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5, 'ϛ': 6, 'ζ': 7, 'η': 8, 'θ': 9, 'ι': 10,
  'κ': 20, 'λ': 30, 'μ': 40, 'ν': 50, 'ξ': 60, 'ο': 70, 'π': 80, 'ϟ': 90, 'ρ': 100,
  'σ': 200, 'ς': 200, 'τ': 300, 'υ': 400, 'φ': 500, 'χ': 600, 'ψ': 700, 'ω': 800,
};

// Standard value
export function gem(text: string, script: Script): number {
  text = text || '';
  if (script === 'he') {
    let s = 0;
    for (const c of text) s += HE[c] || 0;
    return s;
  }
  if (script === 'gr') {
    let s = 0;
    for (const c of text.toLowerCase()) s += GR[c] || 0;
    return s;
  }
  // English A=1..Z=26
  let s = 0;
  for (const c of text.toUpperCase()) {
    const v = c.charCodeAt(0) - 64;
    if (v >= 1 && v <= 26) s += v;
  }
  return s;
}

export function gemOrdinal(text: string, script: Script): number {
  text = text || '';
  if (script === 'he') {
    let s = 0;
    for (const c of text) s += HEO[c] || 0;
    return s;
  }
  if (script === 'gr') {
    let n = 0;
    for (const c of text.toLowerCase()) if (GR[c]) n++;
    return n;
  }
  // English ordinal == standard
  let s = 0;
  for (const c of text.toUpperCase()) {
    const v = c.charCodeAt(0) - 64;
    if (v >= 1 && v <= 26) s += v;
  }
  return s;
}

// Digital root
export function reduceN(n: number): number {
  n = Math.abs(n);
  while (n > 9) n = String(n).split('').reduce((a, b) => a + +b, 0);
  return n;
}

// Tokenise for retrieval: lowercase, strip non-letters, keep words length > 2.
export function tokens(s: string): string[] {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z\s']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}
