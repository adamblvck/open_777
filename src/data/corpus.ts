// Gematria corpus — curated seed terms; value precomputed at load via gem().
import { gem } from '../lib/gematria';
import type { CorpusEntry, Script } from './models';

type RawCorpus = [Script, string, string, string];

const C: RawCorpus[] = [
  ['he', 'אהבה', 'Ahavah', 'Love'],
  ['he', 'אחד', 'Echad', 'Unity / One'],
  ['he', 'יהוה', 'YHVH', 'The Tetragrammaton'],
  ['he', 'אדני', 'Adonai', 'Lord'],
  ['he', 'אהיה', 'Eheieh', 'I Am — God-name of Kether'],
  ['he', 'אל', 'El', 'God — Chesed'],
  ['he', 'אלהים', 'Elohim', 'Gods'],
  ['he', 'נחש', 'Nachash', 'Serpent'],
  ['he', 'משיח', 'Mashiach', 'Messiah'],
  ['he', 'רוח', 'Ruach', 'Spirit / Air'],
  ['he', 'מים', 'Mayim', 'Water'],
  ['he', 'אש', 'Esh', 'Fire'],
  ['he', 'שדי', 'Shaddai', 'Almighty'],
  ['he', 'מטטרון', 'Metatron', 'Archangel of Kether'],
  ['he', 'אגלא', 'AGLA', 'Notariqon name'],
  ['he', 'אמת', 'Emet', 'Truth'],
  ['he', 'חיים', 'Chaim', 'Life'],
  ['he', 'כתר', 'Kether', 'Crown'],
  ['he', 'חכמה', 'Chokmah', 'Wisdom'],
  ['he', 'בינה', 'Binah', 'Understanding'],
  ['he', 'תפארת', 'Tiphareth', 'Beauty'],
  ['gr', 'αγαπη', 'Agape', 'Love'],
  ['gr', 'λογος', 'Logos', 'The Word'],
  ['gr', 'ιησους', 'Iesous', 'Jesus'],
  ['gr', 'θεος', 'Theos', 'God'],
  ['en', 'LIGHT', 'Light', 'Illumination'],
  ['en', 'WILL', 'Will', 'True will'],
  ['en', 'LOVE', 'Love', '—'],
  ['en', 'TRUTH', 'Truth', '—'],
  ['en', 'MAGICK', 'Magick', 'The art'],
];

export const corpus: CorpusEntry[] = C.map((x) => ({
  script: x[0],
  text: x[1],
  translit: x[2],
  gloss: x[3],
  value: gem(x[1], x[0]),
}));
