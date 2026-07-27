// The 10 Sephiroth — curated copy ported verbatim from the desktop prototype.
import type { Sphere } from './models';

// Tree-of-Life node coordinates in 60×100 SVG space.
const node: Record<number, [number, number]> = {
  1: [30, 6], 2: [52, 22], 3: [8, 22], 4: [52, 42], 5: [8, 42],
  6: [30, 52], 7: [52, 64], 8: [8, 64], 9: [30, 76], 10: [30, 94],
};

type RawSphere = Omit<Sphere, 'type' | 'nx' | 'ny'>;

const raw: RawSphere[] = [
  { id: 'kether', num: 1, title: 'Kether', he: 'כתר', meaning: 'Crown', godname: 'Eheieh', archangel: 'Metatron', choir: 'Chaioth ha-Qadesh', sphere: 'Primum Mobile (Rashith ha-Gilgalim)', color: '#f3eee4', colorName: 'Brilliance (white)', glyph: '✷', desc: 'The first swirling — pure being before it knows it is being. Nothing here is divided.' },
  { id: 'chokmah', num: 2, title: 'Chokmah', he: 'חכמה', meaning: 'Wisdom', godname: 'Yah', archangel: 'Ratziel', choir: 'Auphanim', sphere: 'Zodiac (Masloth)', color: '#9aa0ab', colorName: 'Pure soft blue / grey', glyph: '☄', desc: 'The first force — outward, fathering, the lightning before the word. Will, not yet aimed.' },
  { id: 'binah', num: 3, title: 'Binah', he: 'בינה', meaning: 'Understanding', godname: 'YHVH Elohim', archangel: 'Tzaphkiel', choir: 'Aralim', sphere: 'Saturn (Shabbathai)', color: '#6b6478', colorName: 'Crimson / black', glyph: '♄', desc: 'The great sea that gives form to force; the sorrow and patience of being shaped at all.' },
  { id: 'chesed', num: 4, title: 'Chesed', he: 'חסד', meaning: 'Mercy', godname: 'El', archangel: 'Tzadkiel', choir: 'Chasmalim', sphere: 'Jupiter (Tzedek)', color: '#4a7fff', colorName: 'Deep violet / blue', glyph: '♃', desc: 'The kind ruler; abundance that organises without crushing. Authority worn lightly.' },
  { id: 'geburah', num: 5, title: 'Geburah', he: 'גבורה', meaning: 'Severity', godname: 'Elohim Gibor', archangel: 'Khamael', choir: 'Seraphim', sphere: 'Mars (Madim)', color: '#e0464b', colorName: 'Orange / scarlet', glyph: '♂', desc: 'The necessary cut. The strength that removes what must not continue.' },
  { id: 'tiphareth', num: 6, title: 'Tiphareth', he: 'תפארת', meaning: 'Beauty', godname: 'YHVH Eloah va-Daath', archangel: 'Raphael', choir: 'Malachim', sphere: 'Sol (Shemesh)', color: '#fcbd3f', colorName: 'Clear rose pink / gold', glyph: '☉', desc: 'The heart and centre; the harmoniser where all paths meet and the self is reborn.' },
  { id: 'netzach', num: 7, title: 'Netzach', he: 'נצח', meaning: 'Victory', godname: 'YHVH Tzabaoth', archangel: 'Haniel', choir: 'Elohim', sphere: 'Venus (Nogah)', color: '#34c08a', colorName: 'Amber / emerald', glyph: '♀', desc: 'The endurance of desire; feeling, art, and the long pull of what you love.' },
  { id: 'hod', num: 8, title: 'Hod', he: 'הוד', meaning: 'Splendour', godname: 'Elohim Tzabaoth', archangel: 'Michael', choir: 'Beni Elohim', sphere: 'Mercury (Kokab)', color: '#ff8a3d', colorName: 'Violet purple / orange', glyph: '☿', desc: 'The naming mind; language, system, and the splendour of thought arranged.' },
  { id: 'yesod', num: 9, title: 'Yesod', he: 'יסוד', meaning: 'Foundation', godname: 'Shaddai El Chai', archangel: 'Gabriel', choir: 'Cherubim', sphere: 'Luna (Levanah)', color: '#9d6bff', colorName: 'Indigo / violet', glyph: '☽', desc: 'The treasure-house of images; dream, tide, and the engine beneath appearance.' },
  { id: 'malkuth', num: 10, title: 'Malkuth', he: 'מלכות', meaning: 'Kingdom', godname: 'Adonai ha-Aretz', archangel: 'Sandalphon', choir: 'Ashim', sphere: 'Earth (Cholom Yesodoth)', color: '#b9a44a', colorName: 'Citrine, olive, russet, black', glyph: '⊕', desc: 'The world arrived at; the body, the floor, the place where all the rest must finally land.' },
];

export const spheres: Sphere[] = raw.map((s) => ({
  ...s,
  type: 'sphere' as const,
  nx: node[s.num][0],
  ny: node[s.num][1],
}));
