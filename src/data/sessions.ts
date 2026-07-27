// Default scrying sessions (shown until the user saves their own).
import type { Session } from './models';

export const sessionsDefault: Session[] = [
  { id: 's1', title: 'Scrying the path of Tav', date: '14 days ago · The Universe', element: 'Earth', text: '' },
  { id: 's2', title: 'Sol meditation — the heart', date: '3 days ago · Tiphareth', element: 'Fire', text: '' },
];
