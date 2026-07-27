import { useEffect, useState } from 'react';
import { loadGlossary, glossaryReady } from '../lib/glossary';

/** Triggers the lazy 2.3 MB glossary load and re-renders when it's ready. */
export function useGlossary(): boolean {
  const [ready, setReady] = useState(glossaryReady());
  useEffect(() => {
    let alive = true;
    if (!ready) loadGlossary().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [ready]);
  return ready;
}
