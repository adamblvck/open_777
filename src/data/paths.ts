// The 22 Paths — curated copy ported verbatim from the desktop prototype.
import type { Path } from './models';

type RawPath = [number, string, string, string, string, string, string];

const P: RawPath[] = [
  [11, 'א', 'Aleph', 'The Fool', 'Air', 'Kether', 'Chokmah'],
  [12, 'ב', 'Beth', 'The Magus', 'Mercury', 'Kether', 'Binah'],
  [13, 'ג', 'Gimel', 'The Priestess', 'Luna', 'Kether', 'Tiphareth'],
  [14, 'ד', 'Daleth', 'The Empress', 'Venus', 'Chokmah', 'Binah'],
  [15, 'ה', 'Heh', 'The Emperor', 'Aries', 'Chokmah', 'Tiphareth'],
  [16, 'ו', 'Vau', 'The Hierophant', 'Taurus', 'Chokmah', 'Chesed'],
  [17, 'ז', 'Zain', 'The Lovers', 'Gemini', 'Binah', 'Tiphareth'],
  [18, 'ח', 'Cheth', 'The Chariot', 'Cancer', 'Binah', 'Geburah'],
  [19, 'ט', 'Teth', 'Lust', 'Leo', 'Chesed', 'Geburah'],
  [20, 'י', 'Yod', 'The Hermit', 'Virgo', 'Chesed', 'Tiphareth'],
  [21, 'כ', 'Kaph', 'Fortune', 'Jupiter', 'Chesed', 'Netzach'],
  [22, 'ל', 'Lamed', 'Adjustment', 'Libra', 'Geburah', 'Tiphareth'],
  [23, 'מ', 'Mem', 'The Hanged Man', 'Water', 'Geburah', 'Hod'],
  [24, 'נ', 'Nun', 'Death', 'Scorpio', 'Tiphareth', 'Netzach'],
  [25, 'ס', 'Samekh', 'Art', 'Sagittarius', 'Tiphareth', 'Yesod'],
  [26, 'ע', 'Ayin', 'The Devil', 'Capricorn', 'Tiphareth', 'Hod'],
  [27, 'פ', 'Peh', 'The Tower', 'Mars', 'Netzach', 'Hod'],
  [28, 'צ', 'Tzaddi', 'The Star', 'Aquarius', 'Netzach', 'Yesod'],
  [29, 'ק', 'Qoph', 'The Moon', 'Pisces', 'Netzach', 'Malkuth'],
  [30, 'ר', 'Resh', 'The Sun', 'Sol', 'Hod', 'Yesod'],
  [31, 'ש', 'Shin', 'The Aeon', 'Fire / Spirit', 'Hod', 'Malkuth'],
  [32, 'ת', 'Tav', 'The Universe', 'Saturn', 'Yesod', 'Malkuth'],
];

export const paths: Path[] = P.map((p) => ({
  id: 'path' + p[0],
  type: 'path' as const,
  num: p[0],
  he: p[1],
  letter: p[2],
  trump: p[3],
  attr: p[4],
  from: p[5],
  to: p[6],
  title: p[2],
  desc:
    'Path ' + p[0] + ' — ' + p[3] + '. The current that runs between ' +
    p[5] + ' and ' + p[6] + ', carried by the letter ' + p[2] + '.',
}));
