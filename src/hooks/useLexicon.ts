import { useEffect, useState } from 'react';
import { loadLexicon, lexiconReady } from '../lib/gematriaLexicon';

/** Triggers the lazy Strong's-lexicon load and re-renders when it's ready. */
export function useLexicon(): boolean {
  const [ready, setReady] = useState(lexiconReady());
  useEffect(() => {
    let alive = true;
    if (!ready) loadLexicon().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}
