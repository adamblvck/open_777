// The 12 zodiac signs — curated copy ported verbatim from the desktop prototype.
import type { Zodiac } from './models';

type RawZodiac = [string, string, string, string, string, string, string, string];

const Z: RawZodiac[] = [
  ['aries', 'Aries', '♈', 'Fire', 'Cardinal', 'Mars', 'Heh (15)', 'טלה'],
  ['taurus', 'Taurus', '♉', 'Earth', 'Fixed', 'Venus', 'Vau (16)', 'שור'],
  ['gemini', 'Gemini', '♊', 'Air', 'Mutable', 'Mercury', 'Zain (17)', 'תאומים'],
  ['cancer', 'Cancer', '♋', 'Water', 'Cardinal', 'Luna', 'Cheth (18)', 'סרטן'],
  ['leo', 'Leo', '♌', 'Fire', 'Fixed', 'Sol', 'Teth (19)', 'אריה'],
  ['virgo', 'Virgo', '♍', 'Earth', 'Mutable', 'Mercury', 'Yod (20)', 'בתולה'],
  ['libra', 'Libra', '♎', 'Air', 'Cardinal', 'Venus', 'Lamed (22)', 'מאזנים'],
  ['scorpio', 'Scorpio', '♏', 'Water', 'Fixed', 'Mars', 'Nun (24)', 'עקרב'],
  ['sagittarius', 'Sagittarius', '♐', 'Fire', 'Mutable', 'Jupiter', 'Samekh (25)', 'קשת'],
  ['capricorn', 'Capricorn', '♑', 'Earth', 'Cardinal', 'Saturn', 'Ayin (26)', 'גדי'],
  ['aquarius', 'Aquarius', '♒', 'Air', 'Fixed', 'Saturn', 'Tzaddi (28)', 'דלי'],
  ['pisces', 'Pisces', '♓', 'Water', 'Mutable', 'Jupiter', 'Qoph (29)', 'דגים'],
];

export const zodiac: Zodiac[] = Z.map((z) => ({
  id: z[0],
  type: 'zodiac' as const,
  title: z[1],
  glyph: z[2],
  element: z[3],
  quality: z[4],
  ruler: z[5],
  path: z[6],
  he: z[7],
  desc:
    'The ' + z[3].toLowerCase() + ' ' + z[4].toLowerCase() + ' sign ruled by ' +
    z[5] + '; walked on the path of ' + z[6] + '.',
}));
