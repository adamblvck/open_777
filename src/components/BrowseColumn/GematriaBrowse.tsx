import { useEffect, useMemo, useState } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { analyzeGematria } from '../../lib/gematriaEngine';
import { matchesFor } from '../../lib/gematriaLexicon';
import { useLexicon } from '../../hooks/useLexicon';

export default function GematriaBrowse() {
  const gemInput = useOpen777((s) => s.gemInput);
  const ready = useLexicon();
  const [showAll, setShowAll] = useState(false);

  const value = useMemo(() => (gemInput.trim() ? analyzeGematria(gemInput).primaryValue : 0), [gemInput]);
  const matches = useMemo(() => (value > 0 && ready ? matchesFor(value) : []), [value, ready]);
  const visible = showAll ? matches : matches.slice(0, 40);

  useEffect(() => setShowAll(false), [value]);

  const header =
    value <= 0 ? 'Begin typing' : !ready ? 'Loading lexicon…' : matches.length > 0 ? `${matches.length} word${matches.length === 1 ? '' : 's'} share the value ${value}` : `No catalogued words at value ${value}`;

  return (
    <>
      <div style={{ padding: '14px 24px 8px', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--faint)' }}>{header}</div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 26px' }}>
        {visible.map((m) => (
          <div key={m.s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 11, marginBottom: 2, background: 'transparent' }}>
            <div style={{ minWidth: 60, textAlign: 'right', fontFamily: 'var(--serif2)', fontSize: 22, color: 'var(--cream)', direction: 'rtl' }}>{m.w}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--muted)' }}>{m.x}</div>
              {m.g ? <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.g}</div> : null}
            </div>
            <div style={{ fontSize: 10, color: 'var(--faint)', flex: 'none' }}>{m.s}</div>
          </div>
        ))}
        {matches.length > 40 && !showAll ? (
          <div onClick={() => setShowAll(true)} style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: 'var(--purple)', cursor: 'pointer' }}>Show all {matches.length}</div>
        ) : null}
      </div>
    </>
  );
}
