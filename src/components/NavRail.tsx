import { useOpen777, type Mode } from '../state/useOpen777';
import AccountMenu from './common/AccountMenu';

const NAV: { key: Mode; glyph: string; short: string; label: string }[] = [
  { key: 'reference', glyph: '✷', short: 'Ref', label: 'Reference' },
  { key: 'gematria', glyph: 'ℵ', short: 'Gem', label: 'Gematria' },
  { key: 'scrying', glyph: '◉', short: 'Scry', label: 'Scrying chamber' },
  { key: 'queque', glyph: '✺', short: 'Ask', label: 'Ask QueQue' },
  { key: 'glossary', glyph: '⌽', short: 'Gloss', label: 'Correspondence glossary' },
  { key: 'journey', glyph: '⇡', short: 'Path', label: 'Pathworking journey' },
  { key: 'grid', glyph: '▦', short: 'Grid', label: 'Full correspondence grid' },
  { key: 'texts', glyph: '☷', short: 'Texts', label: 'Liber texts' },
  { key: 'myrecords', glyph: '⊚', short: 'Mine', label: 'My records (cloud)' },
  { key: 'tree', glyph: '⯑', short: 'Tree', label: 'Your Tree of Life' },
  { key: 'search', glyph: '⌕', short: 'Find', label: 'Search your scrying' },
];

export default function NavRail() {
  const mode = useOpen777((s) => s.mode);
  const setMode = useOpen777((s) => s.setMode);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '22px 0 18px',
        background: 'var(--navbg)',
        borderRight: '1px solid var(--line)',
      }}
    >
      <div
        style={{
          fontSize: 26,
          color: 'var(--purple)',
          filter: 'drop-shadow(0 0 13px var(--purple))',
          animation: 'o7glow 5s ease-in-out infinite',
          marginBottom: 30,
        }}
      >
        ✷
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {NAV.map((n) => {
          const active = mode === n.key;
          return (
            <div
              key={n.key}
              onClick={() => setMode(n.key)}
              title={n.label}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'background .18s, color .18s',
                background: active ? 'rgba(157,107,255,.16)' : 'transparent',
                color: active ? 'var(--purple)' : 'var(--faint)',
                boxShadow: active ? 'inset 0 0 0 1px rgba(157,107,255,.4)' : 'none',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{n.glyph}</span>
              <span style={{ fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                {n.short}
              </span>
            </div>
          );
        })}
      </div>
      <AccountMenu />
    </div>
  );
}
