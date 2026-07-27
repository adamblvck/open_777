// The 7 classical planets — curated copy ported verbatim from the desktop prototype.
import type { Planet } from './models';

type RawPlanet = Omit<Planet, 'type'>;

const raw: RawPlanet[] = [
  { id: 'sol', title: 'Sol', he: 'שמש', glyph: '☉', sphere: 'Tiphareth (6)', metal: 'Gold', day: 'Sunday', desc: 'The heart-light; the centre that harmonises all it touches.' },
  { id: 'luna', title: 'Luna', he: 'לבנה', glyph: '☽', sphere: 'Yesod (9)', metal: 'Silver', day: 'Monday', desc: 'The tide-maker; reflection, dream, and the rhythm of return.' },
  { id: 'mercury', title: 'Mercury', he: 'כוכב', glyph: '☿', sphere: 'Hod (8)', metal: 'Quicksilver', day: 'Wednesday', desc: 'The messenger; quick mind, speech, and the crossing of thresholds.' },
  { id: 'venus', title: 'Venus', he: 'נוגה', glyph: '♀', sphere: 'Netzach (7)', metal: 'Copper', day: 'Friday', desc: 'The lover; art, attraction, and the long endurance of desire.' },
  { id: 'mars', title: 'Mars', he: 'מאדים', glyph: '♂', sphere: 'Geburah (5)', metal: 'Iron', day: 'Tuesday', desc: 'The warrior; severance, courage, and the clean edge.' },
  { id: 'jupiter', title: 'Jupiter', he: 'צדק', glyph: '♃', sphere: 'Chesed (4)', metal: 'Tin', day: 'Thursday', desc: 'The benefactor; expansion, mercy, and lawful abundance.' },
  { id: 'saturn', title: 'Saturn', he: 'שבתאי', glyph: '♄', sphere: 'Binah (3)', metal: 'Lead', day: 'Saturday', desc: 'The keeper of limits; time, structure, and the discipline of form.' },
];

export const planets: Planet[] = raw.map((p) => ({ ...p, type: 'planet' as const }));
