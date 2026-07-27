import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import TreeOfLife from '../components/TreeOfLife';
import { useOpen777, type Mode } from '../state/useOpen777';

const ALL_PATHS = Array.from({ length: 22 }, (_, i) => i + 11); // 11..32
const ALL_NODES = Array.from({ length: 32 }, (_, i) => i + 1); // 1..32

const CHAMBERS: { glyph: string; name: string; line: string; mode: Mode }[] = [
  { glyph: '✷', name: 'Reference', mode: 'reference', line: 'Browse Spheres, Paths, Planets and Zodiac. Read the canonical Liber 777 attributions — then write the meaning you have lived.' },
  { glyph: 'ℵ', name: 'Gematria', mode: 'gematria', line: 'Type a word in Hebrew, Greek or English. Get its value, and every term in your corpus that answers to the same number.' },
  { glyph: '◉', name: 'Scrying', mode: 'scrying', line: 'Capture a vision — record, upload, transcribe or type — and surface its dominant element, sphere and numeric resonance.' },
  { glyph: '✺', name: 'Ask QueQue', mode: 'queque', line: 'A conversational search across everything you have ever captured, answered with citations from your own library.' },
];

const SHOWCASE: { sel: number[]; label: string }[] = [
  { sel: [1], label: 'Kether' },
  { sel: [6, 13, 25], label: 'Tiphareth' },
  { sel: [7, 8, 27], label: 'Netzach–Hod' },
  { sel: [9, 25, 28, 32], label: 'Yesod' },
  { sel: ALL_NODES, label: 'The whole Tree' },
];

const go = (mode: Mode) => useOpen777.getState().setMode(mode);

const kicker: CSSProperties = { fontFamily: 'var(--ui)', fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)' };
const h2: CSSProperties = { fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(30px, 4vw, 44px)', color: 'var(--cream)', margin: 0 };
const section: CSSProperties = { padding: '96px 24px', borderTop: '1px solid var(--line)' };
const ctaPrimary: CSSProperties = { fontSize: 15, fontWeight: 600, padding: '15px 30px', borderRadius: 999, background: 'var(--purple)', color: '#0a0810', boxShadow: '0 0 30px rgba(157,107,255,.4)', textDecoration: 'none', display: 'inline-block' };
const card: CSSProperties = { display: 'block', textDecoration: 'none', borderRadius: 20, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' };

export default function LandingPage() {
  return (
    <div className="o7-root" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '96px 24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 55% at 50% 36%, rgba(157,107,255,.18), transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none', opacity: 0.16, filter: 'drop-shadow(0 0 26px rgba(157,107,255,.55))' }}>
          <TreeOfLife height={700} radiusSephira={18} selected={ALL_NODES} pathwayColor="#9d6bff" />
        </div>

        <div style={{ position: 'relative', zIndex: 10, margin: '0 auto', textAlign: 'center', maxWidth: 720 }}>
          <div style={{ fontSize: 40, color: 'var(--purple)', filter: 'drop-shadow(0 0 16px var(--purple))', animation: 'o7glow 5s ease-in-out infinite' }}>✷</div>
          <div style={{ ...kicker, marginTop: 28 }}>A scrying &amp; correspondence workbench</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(56px, 11vw, 108px)', lineHeight: 0.92, color: 'var(--cream)', margin: '16px 0 0' }}>
            Open <span style={{ color: 'var(--purple)' }}>777</span>
          </h1>
          <p style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 'clamp(18px, 2.4vw, 23px)', color: 'var(--muted)', maxWidth: 620, lineHeight: 1.5, margin: '24px auto 0' }}>
            Aleister Crowley's tables of correspondence — the Tree of Life, the 22 paths, the god-names and gematria — rebuilt as a quiet workstation for study, scrying, and your own interpretation.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginTop: 40 }}>
            <Link to="/app" onClick={() => go('reference')} style={ctaPrimary}>Enter the workstation →</Link>
            <Link to="/app" onClick={() => go('grid')} style={{ fontSize: 15, padding: '15px 28px', borderRadius: 999, color: 'var(--muted)', boxShadow: 'inset 0 0 0 1px var(--line2)', textDecoration: 'none' }}>Open the full grid</Link>
          </div>
          <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 24 }}>Backed by the real Liber 777 corpus · free &amp; open source · best on desktop</div>
        </div>
      </section>

      {/* ===== FOUR CHAMBERS ===== */}
      <section style={section}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={kicker}>One shell, four working modes</div>
            <h2 style={{ ...h2, marginTop: 12, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>A chamber for every way of working the system</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20, marginTop: 56 }}>
            {CHAMBERS.map((c) => (
              <Link key={c.name} to="/app" onClick={() => go(c.mode)} style={{ ...card, padding: '26px 24px 28px' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0810', boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--purple)', fontSize: 24 }}>{c.glyph}</div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22, color: 'var(--cream)', marginTop: 16 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--dim)', lineHeight: 1.5, marginTop: 8 }}>{c.line}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TREE SHOWCASE ===== */}
      <section style={{ ...section, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', userSelect: 'none', opacity: 0.05 }}>
          <TreeOfLife height={560} radiusSephira={20} selected={ALL_PATHS} pathwayColor="#7c3aed" />
        </div>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={kicker}>Ten Sephiroth · twenty-two paths</div>
          <h2 style={{ ...h2, marginTop: 12 }}>The Tree of Life, everywhere</h2>
          <p style={{ fontFamily: 'var(--serif2)', fontSize: 17, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.6, margin: '20px auto 0' }}>
            Every sphere, path and correspondence maps back to the glyph. Each node lights in its King-scale colour so you always know where you stand.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 28, marginTop: 48 }}>
            {SHOWCASE.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 16, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                  <TreeOfLife height={96} radiusSephira={3.4} selected={s.sel} pathwayColor="#9d6bff" />
                </div>
                <span style={{ fontFamily: 'var(--ui)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ALSO INCLUDES ===== */}
      <section style={section}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ ...kicker, textAlign: 'center' }}>And the full reference, preserved</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 40 }}>
            <Link to="/app" onClick={() => go('grid')} style={{ ...card, padding: 28 }}>
              <div style={{ fontSize: 26, color: 'var(--purple)' }}>▦</div>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 21, color: 'var(--cream)', marginTop: 12 }}>The complete 35-column grid</div>
              <div style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--dim)', lineHeight: 1.5, marginTop: 8 }}>The whole of Liber 777 in a searchable data grid and a card view — colour scales, god-names, weapons, perfumes and all.</div>
            </Link>
            <Link to="/app" onClick={() => go('texts')} style={{ ...card, padding: 28 }}>
              <div style={{ fontSize: 26, color: 'var(--purple)' }}>☷</div>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 21, color: 'var(--cream)', marginTop: 12 }}>The Liber texts, to hand</div>
              <div style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--dim)', lineHeight: 1.5, marginTop: 8 }}>Liber O, Liber E, Resh, Samekh, LXV and III — the instruction texts of the A∴A∴ curriculum, in a clean reader.</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ ...section, textAlign: 'center' }}>
        <div style={{ fontSize: 30, color: 'var(--purple)', filter: 'drop-shadow(0 0 14px var(--purple))', animation: 'o7glow 6s ease-in-out infinite' }}>✷</div>
        <h2 style={{ ...h2, marginTop: 20 }}>Begin where the work is quiet</h2>
        <div style={{ marginTop: 32 }}>
          <Link to="/app" onClick={() => go('reference')} style={ctaPrimary}>Enter the workstation →</Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--serif2)', fontSize: 14, color: 'var(--faint)' }}>
          Made with care by <a href="https://adamblvck.com" style={{ color: 'var(--dim)' }}>Adam Blvck</a>
          {'  ·  '}
          <a href="https://github.com/adamblvck/open_777" style={{ color: 'var(--dim)' }}>open source on GitHub</a>
        </div>
      </footer>
    </div>
  );
}
