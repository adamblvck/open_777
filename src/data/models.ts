// Open 777 — typed data models. Field lists mirror the desktop handoff.
import type { Element } from '../theme';

export type Script = 'he' | 'gr' | 'en';
export type EntryType = 'sphere' | 'path' | 'planet' | 'zodiac';
export type Category = 'spheres' | 'paths' | 'planets' | 'zodiac';

export interface Sphere {
  type: 'sphere';
  id: string;
  num: number; // 1..10
  title: string;
  he: string;
  meaning: string;
  godname: string;
  archangel: string;
  choir: string;
  sphere: string; // mundane sphere
  color: string; // curated King-scale hex (badge dot + hero glow)
  colorName: string;
  glyph: string;
  desc: string;
  nx: number; // Tree-of-Life node coords (60×100 SVG space)
  ny: number;
}

export interface Path {
  type: 'path';
  id: string;
  num: number; // 11..32
  he: string;
  letter: string;
  trump: string;
  attr: string;
  from: string;
  to: string;
  title: string;
  desc: string;
}

export interface Planet {
  type: 'planet';
  id: string;
  title: string;
  he: string;
  glyph: string;
  sphere: string;
  metal: string;
  day: string;
  desc: string;
}

export interface Zodiac {
  type: 'zodiac';
  id: string;
  title: string;
  glyph: string;
  element: string;
  quality: string;
  ruler: string;
  path: string;
  he: string;
  desc: string;
}

export type Entry = Sphere | Path | Planet | Zodiac;

export interface CorpusEntry {
  script: Script;
  text: string;
  translit: string;
  gloss: string;
  value: number; // computed at load via gem(text, script)
}

export interface LibraryThing {
  id: string;
  element: Element;
  title: string;
  body: string;
  keys: string[];
}

export interface Session {
  id: string;
  title: string;
  date: string;
  element: string;
  text: string;
}

export interface ReadingTerm {
  label: string;
  glyph: string;
  color: string;
  id: string;
}

export interface ReadingHit {
  text: string;
  value: number;
  gloss: string;
}

export interface Reading {
  elem: string;
  elemColor: string;
  elemGlyph: string;
  sphere: string;
  sphereId: string;
  terms: ReadingTerm[];
  hits: ReadingHit[];
  summary: string;
}

export interface Citation {
  title: string;
  element: string;
  score: string;
}

export interface ChatMsg {
  role: 'me' | 'queque';
  text: string;
  cites?: Citation[];
}
