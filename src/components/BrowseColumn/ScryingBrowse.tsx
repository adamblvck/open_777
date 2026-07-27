import { useOpen777 } from '../../state/useOpen777';
import { EL, type Element } from '../../theme';

export default function ScryingBrowse() {
  const sessions = useOpen777((s) => s.sessions);
  const activeSession = useOpen777((s) => s.activeSession);
  const loadSession = useOpen777((s) => s.loadSession);

  return (
    <>
      <div style={{ padding: '14px 24px 8px', fontSize: 10, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--faint)' }}>
        Sessions
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 26px' }}>
        {sessions.map((s) => {
          const active = activeSession === s.id;
          const dot = EL[s.element as Element]?.c || '#9d6bff';
          return (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              style={{
                padding: '13px 13px',
                borderRadius: 13,
                cursor: 'pointer',
                marginBottom: 4,
                background: active ? 'rgba(157,107,255,.1)' : 'transparent',
                boxShadow: active ? 'inset 0 0 0 1px rgba(157,107,255,.3)' : 'inset 0 0 0 1px var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', background: dot, boxShadow: `0 0 7px ${dot}` }} />
                <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17, color: 'var(--cream)', lineHeight: 1.1 }}>{s.title}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 5, paddingLeft: 17 }}>{s.date}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
