// Ask QueQue retrieval — ported from the prototype's sendChat().
// Lightweight token-overlap scoring; swap for embeddings when a backend exists.
import { tokens } from './gematria';
import { libraryDefault } from '../data/library';
import type { Citation, LibraryThing } from '../data/models';

export interface Retrieved {
  answer: string;
  cites: Citation[];
}

export function retrieve(query: string): Retrieved {
  const q = (query || '').trim();
  const toks = tokens(q);

  const scored = libraryDefault
    .map((it) => {
      const hay = (it.title + ' ' + it.body + ' ' + it.element + ' ' + it.keys.join(' ')).toLowerCase();
      let s = 0;
      // README intent: title hits ×3, key hits +2, other hits +1.
      toks.forEach((w) => {
        if (hay.includes(w)) {
          s += it.title.toLowerCase().includes(w) ? 3 : 1;
          if (it.keys.includes(w)) s += 2;
        }
      });
      return { it, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);

  if (!scored.length) {
    return {
      answer:
        'Nothing in your library speaks directly to "' + q + '" yet. When you next scry it, capture it as a Thing — and the next time you ask, it will surface here.',
      cites: [],
    };
  }

  const top = scored[0].it;
  const maxS = scored[0].s || 1;
  const cites: Citation[] = scored.map((x) => ({
    title: x.it.title,
    element: x.it.element,
    score: (0.5 + 0.49 * (x.s / maxS)).toFixed(2),
  }));
  const others = scored.slice(1).map((x) => x.it.title);
  const answer =
    'Three captures answer to that. "' + top.title + '" sits closest — ' + top.element.toLowerCase() + '-ward, ' + top.body.split(',')[0].trim() + '. ' +
    (others.length ? 'You returned to the same terrain in ' + others.map((t) => '"' + t + '"').join(' and ') + '. ' : '') +
    'The thread between them reads ' + top.element + '. Re-read "' + top.title + '" before your next sitting, and notice what has changed in you since you wrote it.';

  return { answer, cites };
}

// Browse-column relevance scoring after a query (highlights matched things).
export interface LibScore {
  it: LibraryThing;
  s: number;
}

export function scoreLibrary(lastQuery: string): { scored: LibScore[]; maxLib: number } {
  const ltoks = tokens(lastQuery);
  const scored: LibScore[] = libraryDefault.map((it) => {
    const hay = (it.title + ' ' + it.body + ' ' + it.element + ' ' + it.keys.join(' ')).toLowerCase();
    let s = 0;
    ltoks.forEach((w) => { if (hay.includes(w)) s++; });
    return { it, s };
  });
  const maxLib = Math.max(1, ...scored.map((x) => x.s));
  scored.sort((a, b) => b.s - a.s);
  return { scored, maxLib };
}
