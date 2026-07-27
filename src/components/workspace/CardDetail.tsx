import { useMemo, useState } from 'react';
import { usePrefs, type PathDetailView } from '../../state/usePrefs';
import { useOpen777 } from '../../state/useOpen777';
import { useGlossary } from '../../hooks/useGlossary';
import { buildPathGroups, type PathRow } from '../../lib/pathGroups';
import { expandCell } from '../../lib/glossary';
import InfoDot from '../common/InfoDot';
import GlossaryPopover from '../common/GlossaryPopover';

const VIEWS: [PathDetailView, string][] = [
  ['cards', 'Cards'],
  ['twoCol', '2 columns'],
  ['table', 'Table'],
];

type PopState = { kind: 'category' | 'entry'; row: PathRow; x: number; y: number } | null;

function Swatch({ hex }: { hex: string }) {
  return <span style={{ width: 12, height: 12, borderRadius: 3, background: hex, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.15)', flex: 'none', display: 'inline-block' }} />;
}

export default function CardDetail({ column }: { column: number }) {
  const view = usePrefs((s) => s.pathDetailView);
  const setView = usePrefs((s) => s.setPathDetailView);
  const favs = usePrefs((s) => s.favoriteRowIndices);
  const toggleFav = usePrefs((s) => s.toggleFavoriteRow);
  const flash = useOpen777((s) => s.flash);
  const ready = useGlossary(); // warm the glossary so ⓘ + value taps resolve
  const [pop, setPop] = useState<PopState>(null);

  const groups = useMemo(() => buildPathGroups(column), [column]);
  const hasEntry = (row: PathRow) => ready && expandCell(row.value).length > 0;

  const open = (kind: 'category' | 'entry', row: PathRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPop({ kind, row, x: Math.min(r.left, window.innerWidth - 360), y: r.bottom + 6 });
  };

  const copyAll = () => {
    const lines: string[] = [];
    groups.forEach((g) => g.rows.forEach((r) => lines.push(`${r.label}: ${r.value}`)));
    try {
      navigator.clipboard.writeText(lines.join('\n'));
      flash('Copied all correspondences.');
    } catch {
      /* clipboard unavailable */
    }
  };

  const Star = ({ idx }: { idx: number }) => (
    <span onClick={(e) => { e.stopPropagation(); toggleFav(idx); }} style={{ cursor: 'pointer', fontSize: 13, color: favs.includes(idx) ? '#FACC15' : 'var(--faint)', flex: 'none' }}>
      {favs.includes(idx) ? '★' : '☆'}
    </span>
  );

  // Label cell: ★ favourite + ⓘ category glossary + the category name.
  const LabelCell = ({ row, small }: { row: PathRow; small?: boolean }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Star idx={row.rowIdx} />
      <InfoDot size={small ? 14 : 15} active={pop?.row.rowIdx === row.rowIdx && pop.kind === 'category'} onClick={(e) => open('category', row, e)} />
      <span style={{ fontSize: small ? 11 : 12.5, color: 'var(--dim)' }}>{row.label}</span>
    </span>
  );

  // Value cell: a swatch (colours) + the value, tappable to its glossary entry.
  const ValueCell = ({ row, fontSize, align = 'left' }: { row: PathRow; fontSize: number; align?: 'left' | 'right' }) => {
    const tappable = hasEntry(row);
    return (
      <span
        onClick={tappable ? (e) => open('entry', row, e) : undefined}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', fontFamily: 'var(--serif2)', fontSize, color: tappable ? 'var(--purple2)' : 'var(--cream)', direction: row.valueType === 'hebrew' ? 'rtl' : 'ltr', cursor: tappable ? 'pointer' : 'default' }}
      >
        {row.colorHex ? <Swatch hex={row.colorHex} /> : null}
        {row.value}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
          {VIEWS.map(([v, lbl]) => (
            <span key={v} onClick={() => setView(v)} style={{ fontSize: 12, fontWeight: 500, padding: '6px 13px', borderRadius: 8, cursor: 'pointer', background: view === v ? 'var(--purple)' : 'transparent', color: view === v ? '#0a0810' : 'var(--muted)' }}>{lbl}</span>
          ))}
        </div>
        <span onClick={copyAll} style={{ fontSize: 12, padding: '7px 13px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}>⧉ Copy all</span>
      </div>

      {groups.map((g) => (
        <div key={g.id} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--purpledim)', marginBottom: 10 }}>{g.title} · {g.rows.length}</div>

          {view === 'table' ? (
            g.rows.map((r) => (
              <div key={r.rowIdx} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '.5px solid var(--line)', alignItems: 'baseline' }}>
                <span style={{ flex: '0 0 44%' }}><LabelCell row={r} small /></span>
                <span style={{ flex: 1, textAlign: 'right' }}><ValueCell row={r} fontSize={15} align="right" /></span>
              </div>
            ))
          ) : view === 'twoCol' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 9 }}>
              {g.rows.map((r) => (
                <div key={r.rowIdx} style={{ padding: '11px 13px', borderRadius: 12, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
                  <div style={{ marginBottom: 5 }}><LabelCell row={r} small /></div>
                  <ValueCell row={r} fontSize={16} />
                </div>
              ))}
            </div>
          ) : (
            g.rows.map((r) => (
              <div key={r.rowIdx} style={{ padding: '11px 0', borderBottom: '.5px solid var(--line)' }}>
                <div style={{ marginBottom: 5 }}><LabelCell row={r} /></div>
                <div style={{ paddingLeft: 26 }}><ValueCell row={r} fontSize={18} /></div>
              </div>
            ))
          )}
        </div>
      ))}

      {pop ? <GlossaryPopover kind={pop.kind} row={pop.row} x={pop.x} y={pop.y} onClose={() => setPop(null)} /> : null}
    </div>
  );
}
