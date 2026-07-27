// Reference data adapter — projects the REAL Liber 777 dataset
// (src/constants/liber_777.js, 262 rows) onto the curated entries, so the
// Reference attribution panes are backed by Crowley's actual correspondences
// with the hand-authored poetic copy layered on top.
import { Liber777 } from '../constants/liber_777';
import { spheres } from './spheres';
import { paths } from './paths';
import { planets } from './planets';
import { zodiac } from './zodiac';
import type { Entry, Category } from './models';

type Row = Record<string, string>;
const rows = Liber777 as unknown as Row[];

// Resolve dataset rows by their Roman-numeral `index` label, once at load.
const rowByLabel = new Map<string, Row>();
rows.forEach((r) => { if (r && r.index) rowByLabel.set(r.index, r); });

// Normalise a raw cell: collapse embedded \r\n, treat '...'/'' as absent,
// soften the dataset's [[secondary]] annotation syntax.
export function cleanCell(v: unknown): string {
  if (v == null) return '';
  let s = String(v).replace(/\r\n/g, ' · ').replace(/\s+/g, ' ').trim();
  if (s === '...' || s === '—' || s === '') return '';
  return s.replace(/\[\[(.+?)\]\]/g, '(also $1)');
}

function cell(label: string, col: number): string {
  const r = rowByLabel.get(label);
  return r ? cleanCell(r[String(col)]) : '';
}

// Real King-scale hex for a column (sphere/path number), or '' if absent.
export function kingScaleHex(num: number): string {
  const raw = cell('XV. King Scale Colors (HEX)', num).replace(/^#/, '');
  return /^[0-9a-fA-F]{6}$/.test(raw) ? '#' + raw : '';
}

// Enrichment rows pulled from the real dataset, by entry type.
const SPHERE_ENRICH: Array<[string, string]> = [
  ['X. Mystic Numbers of the Sephiroth', 'Mystic number'],
  ['V. God Names in Assiah', 'God-name (Assiah)'],
  ['XV. King Scale Colors (Yod)', 'King scale'],
  ['XVI. Queen Scale Colors (Heh)', 'Queen scale'],
  ['XVII. Emperor Scale Colors (Vav)', 'Prince scale'],
  ['XVIII. Empress Scale Colors (Heh)', 'Princess scale'],
  ['XXXVIII. Animals (Real & Imaginary)', 'Animal'],
  ['XXXIX. Plants (Real & Imaginary)', 'Plant'],
  ['XL. Precious Stones', 'Precious stone'],
  ['XLI. Magical Weapons', 'Magical weapon'],
  ['XLII. Perfumes', 'Perfume'],
  ['XLV. Magical Powers [Western Mysticism]', 'Magical power'],
];

const PATH_ENRICH: Array<[string, string]> = [
  ['XIII. Paths of the Sefer Yetzirah', 'Sefer Yetzirah'],
  ['XIV. General Attribution of the Tarot', 'Tarot (full)'],
  ['XV. King Scale Colors (Yod)', 'King scale'],
  ['XVI. Queen Scale Colors (Heh)', 'Queen scale'],
  ['XXXVIII. Animals (Real & Imaginary)', 'Animal'],
  ['XXXIX. Plants (Real & Imaginary)', 'Plant'],
  ['XL. Precious Stones', 'Precious stone'],
  ['XLI. Magical Weapons', 'Magical weapon'],
  ['XLII. Perfumes', 'Perfume'],
];

export interface Attribution {
  k: string;
  v: string;
}

// Real canonical attributions from Liber 777 for spheres & paths (which map
// 1:1 onto the dataset's 32 columns). Planets/zodiac are fully covered by
// their curated fields, so they return none here.
export function realAttributions(entry: Entry): Attribution[] {
  let enrich: Array<[string, string]> | null = null;
  let col = 0;
  if (entry.type === 'sphere') { enrich = SPHERE_ENRICH; col = entry.num; }
  else if (entry.type === 'path') { enrich = PATH_ENRICH; col = entry.num; }
  if (!enrich) return [];

  const out: Attribution[] = [];
  for (const [label, key] of enrich) {
    const v = cell(label, col);
    if (v) out.push({ k: key, v });
  }
  return out;
}

// ---- entry collections ----
export const allEntries: Entry[] = [...spheres, ...paths, ...planets, ...zodiac];

export function findEntry(id: string): Entry {
  return allEntries.find((e) => e.id === id) || spheres[0];
}

export function byCategory(cat: Category): Entry[] {
  if (cat === 'spheres') return spheres;
  if (cat === 'paths') return paths;
  if (cat === 'planets') return planets;
  return zodiac;
}

export { spheres, paths, planets, zodiac };
