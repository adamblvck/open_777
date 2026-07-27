import { useMemo } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { usePrefs } from '../../state/usePrefs';
import { useGlossary } from '../../hooks/useGlossary';
import { entriesByType, getEntry, type GlossaryEntry } from '../../lib/glossary';
import { getTypeMeta, getLensMeta } from '../../lib/glossaryTypes';
import { spheres } from '../../data/spheres';

// Leading Key-Scale number of a scalePosition ("22 Lamed/Libra" → 22 = column).
function columnFromScalePosition(pos: string): number | null {
  if (/bis/i.test(pos)) return null;
  const m = pos.trim().match(/^(\d+)/);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 32 ? n : null;
}
function columnToEntryId(col: number): string {
  if (col >= 1 && col <= 10) return spheres[col - 1].id;
  return 'path' + col;
}

const sectionLabel = (accent: string): React.CSSProperties => ({ fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: accent, marginBottom: 8, marginTop: 4 });

export default function GlossaryWorkspace() {
  const ready = useGlossary();
  const slug = useOpen777((s) => s.selectedGlossarySlug);
  const jumpToReference = useOpen777((s) => s.jumpToReference);
  const openGlossaryEntry = useOpen777((s) => s.openGlossaryEntry);
  const bookmarks = usePrefs((s) => s.glossaryBookmarks);
  const toggleBookmark = usePrefs((s) => s.toggleGlossaryBookmark);

  const entry: GlossaryEntry | undefined = ready && slug ? getEntry(slug) : undefined;
  const related = useMemo(() => {
    if (!entry) return [];
    return (entriesByType()[entry.type] || []).filter((e) => e.slug !== entry.slug && e.status === 'complete').slice(0, 14);
  }, [entry]);

  if (!entry) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 44, color: 'var(--purpledim)', filter: 'drop-shadow(0 0 18px var(--purple))', animation: 'o7glow 6s ease-in-out infinite' }}>⌽</div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, color: 'var(--muted)', marginTop: 18 }}>The corpus, opened</div>
        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, color: 'var(--faint)', marginTop: 8, maxWidth: 360, lineHeight: 1.5 }}>
          Search 2,300+ Liber 777 correspondences on the left — deities, animals, plants, stones, perfumes, god-names — and select one to read its full account.
        </div>
      </div>
    );
  }

  const m = getTypeMeta(entry.type);
  const accent = m.color;
  const paragraphs = (entry.description || '').split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const bookmarked = bookmarks.includes(entry.slug);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 52px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0810', boxShadow: `inset 0 0 0 1.5px ${accent}, 0 0 22px ${accent}33`, color: accent, fontSize: 30 }}>{m.glyph}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 30, color: 'var(--cream)', lineHeight: 1.05 }}>{entry.displayTerm || entry.term}</div>
            {entry.displayTerm && entry.displayTerm !== entry.term ? <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 1 }}>{entry.term}</div> : null}
            {entry.aliases?.length ? <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 3 }}>{entry.aliases.join(' · ')}</div> : null}
          </div>
          <span onClick={() => toggleBookmark(entry.slug)} style={{ flex: 'none', fontSize: 22, color: bookmarked ? '#FACC15' : 'var(--faint)', cursor: 'pointer', padding: 4 }}>{bookmarked ? '★' : '☆'}</span>
        </div>

        {/* type + lens badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, background: `${accent}1F`, boxShadow: `inset 0 0 0 1px ${accent}66`, color: accent, display: 'flex', gap: 6, alignItems: 'center' }}><span>{m.glyph}</span>{m.label}</span>
          {entry.lenses.map((l) => {
            const lm = getLensMeta(l);
            return <span key={l} style={{ fontSize: 11.5, padding: '5px 11px', borderRadius: 999, boxShadow: `inset 0 0 0 1px ${lm.color}55`, color: lm.color }}>{lm.label}</span>;
          })}
        </div>

        {entry.caution ? (
          <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(224,70,75,.1)', boxShadow: 'inset 0 0 0 1px rgba(224,70,75,.4)', marginBottom: 14 }}>
            <span style={{ color: 'var(--danger)', fontSize: 16 }}>⚠</span>
            <span style={{ fontSize: 13.5, color: '#f0c9c9', lineHeight: 1.5 }}>{entry.caution}</span>
          </div>
        ) : null}

        {entry.summary ? (
          <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 14, marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--serif2)', fontSize: 17, color: 'var(--cream)', lineHeight: 1.55 }}>{entry.summary}</div>
          </div>
        ) : null}

        {paragraphs.length ? (
          paragraphs.map((p, i) => <p key={i} style={{ fontFamily: 'var(--serif2)', fontSize: 16.5, color: 'var(--cream)', lineHeight: 1.66, margin: '0 0 14px' }}>{p}</p>)
        ) : (
          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 14 }}>A full description for this term hasn’t been written yet.</div>
        )}

        {/* provenance */}
        <div style={sectionLabel(accent)}>Where it appears</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
          In {entry.tables.length} {entry.tables.length === 1 ? 'table' : 'tables'} · {entry.occurrences} occurrence{entry.occurrences === 1 ? '' : 's'}
        </div>
        {entry.scalePositions?.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {entry.scalePositions.map((pos) => {
              const col = columnFromScalePosition(pos);
              const tappable = col !== null;
              return (
                <span
                  key={pos}
                  onClick={tappable ? () => jumpToReference(columnToEntryId(col!)) : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: tappable ? 'pointer' : 'default', background: tappable ? `${accent}22` : 'var(--card)', boxShadow: `inset 0 0 0 1px ${tappable ? accent + '66' : 'var(--line)'}`, color: tappable ? accent : 'var(--muted)' }}
                >
                  {pos}{tappable ? ' →' : ''}
                </span>
              );
            })}
          </div>
        ) : null}
        {entry.tables?.length ? <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.5, marginBottom: 16 }}>{entry.tables.join('  ·  ')}</div> : null}

        {/* related */}
        {related.length ? (
          <>
            <div style={sectionLabel(accent)}>Related terms</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {related.map((r) => (
                <span key={r.slug} onClick={() => openGlossaryEntry(r.slug)} style={{ fontSize: 13, padding: '6px 12px', borderRadius: 999, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)', color: 'var(--purple2)', cursor: 'pointer' }}>{r.displayTerm || r.term}</span>
              ))}
            </div>
          </>
        ) : null}

        {/* sources */}
        {entry.sources?.length ? (
          <>
            <div style={sectionLabel(accent)}>Sources</div>
            {entry.sources.map((s, i) => <div key={i} style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.6 }}>• {s}</div>)}
          </>
        ) : null}
      </div>
    </div>
  );
}
