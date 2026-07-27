import { useOpen777 } from '../../state/useOpen777';
import { EL, RAINBOW, type Element } from '../../theme';

const SUGGESTIONS = ['What keeps returning in my grief?', 'Where does my will show up?', 'Show me everything Earth-ward'];

export default function QueQueWorkspace() {
  const chat = useOpen777((s) => s.chat);
  const chatInput = useOpen777((s) => s.chatInput);
  const setChatInput = useOpen777((s) => s.setChatInput);
  const sendChat = useOpen777((s) => s.sendChat);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '30px 52px 22px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: RAINBOW, backgroundSize: '200% 100%', animation: 'o7rainbow 14s linear infinite' }} />
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 26, color: 'var(--cream)', lineHeight: 1 }}>Ask QueQue</div>
            <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)' }}>
              Vector search across everything you have ever captured
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '30px 52px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {chat.map((m, idx) => {
            const mine = m.role === 'me';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', animation: 'o7rise .3s ease both' }}>
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '16px 20px',
                    borderRadius: 18,
                    background: mine ? 'var(--purple)' : 'var(--card)',
                    boxShadow: mine ? 'none' : 'inset 0 0 0 1px var(--line2)',
                    color: mine ? '#0a0810' : 'var(--cream)',
                    fontFamily: mine ? 'var(--ui)' : 'var(--serif2)',
                    fontSize: 16,
                    lineHeight: 1.6,
                  }}
                >
                  {m.text}
                </div>
                {m.cites && m.cites.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 9, maxWidth: '78%' }}>
                    {m.cites.map((c, ci) => {
                      const color = EL[c.element as Element]?.c || '#9d6bff';
                      const eg = EL[c.element as Element]?.g || '✷';
                      return (
                        <span key={ci} style={{ fontSize: 11.5, padding: '6px 12px', borderRadius: 999, background: '#0a0810', boxShadow: `inset 0 0 0 1px ${color}55`, color: 'var(--muted)', display: 'flex', gap: 7, alignItems: 'center' }}>
                          <span style={{ color }}>{eg}</span>
                          {c.title}
                          <span style={{ color: 'var(--faint)' }}>· {c.score}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '18px 52px 30px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map((t) => (
              <span key={t} onClick={() => sendChat(t)} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--dim)', cursor: 'pointer' }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 6px 6px 22px', borderRadius: 999, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendChat();
                }
              }}
              placeholder="Ask across your library — a feeling, a theme, a name…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--cream)', fontSize: 15, padding: '12px 0' }}
            />
            <span onClick={() => sendChat()} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--purple)', color: '#0a0810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', flex: 'none' }}>
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
