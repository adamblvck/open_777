import { useOpen777 } from '../../state/useOpen777';
import { scoreLibrary } from '../../lib/retrieval';
import { libraryDefault } from '../../data/library';
import { EL } from '../../theme';

export default function QueQueBrowse() {
  const lastQuery = useOpen777((s) => s.lastQuery);
  const { scored, maxLib } = scoreLibrary(lastQuery);
  const lq = lastQuery.toLowerCase();

  return (
    <>
      <div style={{ padding: '14px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--faint)' }}>Your library</span>
        <span style={{ fontSize: 11, color: 'var(--purpledim)' }}>{libraryDefault.length} things</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 26px' }}>
        {scored.map(({ it, s }) => {
          const hot = s > 0;
          const eg = EL[it.element]?.g || '✷';
          const dot = EL[it.element]?.c || '#9d6bff';
          const scoreLabel = lq ? (hot ? (0.5 + 0.49 * (s / maxLib)).toFixed(2) : '—') : it.element.toLowerCase();
          const snippet = it.body.split(',').slice(0, 2).join(', ') + '…';
          return (
            <div
              key={it.id}
              style={{
                padding: '12px 13px',
                borderRadius: 13,
                marginBottom: 4,
                background: hot ? 'rgba(157,107,255,.07)' : 'transparent',
                boxShadow: hot ? 'inset 0 0 0 1px rgba(157,107,255,.25)' : 'inset 0 0 0 1px var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: dot, flex: 'none' }}>{eg}</span>
                <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16.5, color: 'var(--cream)', lineHeight: 1.1 }}>{it.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: hot ? 'var(--purple)' : 'var(--faint)' }}>{scoreLabel}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--dim)', marginTop: 5, lineHeight: 1.4, paddingLeft: 24 }}>{snippet}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
