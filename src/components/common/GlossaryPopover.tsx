import { useMemo } from 'react';
import type { PathRow } from '../../lib/pathGroups';
import { expandCell } from '../../lib/glossary';
import { useOpen777 } from '../../state/useOpen777';

// Two-level glossary popover for the card detail (per the mobile handoff):
//  - kind 'category' → the category's definition + a "THIS ENTRY" block.
//  - kind 'entry'    → the value entry's definition, foregrounded.
export default function GlossaryPopover({ kind, row, x, y, onClose }: { kind: 'category' | 'entry'; row: PathRow; x: number; y: number; onClose: () => void }) {
  const openGlossaryEntry = useOpen777((s) => s.openGlossaryEntry);
  const entry = useMemo(() => expandCell(row.value)[0], [row.value]);

  const categoryBody = row.category?.description?.trim() || 'A correspondence category in the Liber 777 grid. A fuller definition is on its way.';
  const entryBody = entry?.description?.trim() || entry?.summary?.trim() || '';
  const hebrew = row.valueType === 'hebrew' ? row.value : undefined;
  const translit = entry?.displayTerm || entry?.term || (row.valueType !== 'hebrew' ? row.value : undefined);

  const EntryBlock = ({ bordered }: { bordered?: boolean }) => (
    <div style={bordered ? { marginTop: 14, paddingTop: 13, borderTop: '.5px solid var(--line2)' } : undefined}>
      <div style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 6 }}>This entry</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {hebrew ? <span style={{ fontFamily: 'var(--serif2)', fontSize: 22, color: 'var(--cream)', direction: 'rtl' }}>{hebrew}</span> : null}
        {translit ? <span style={{ fontFamily: 'var(--serif2)', fontSize: 18, color: 'var(--purple2)' }}>{translit}</span> : null}
        {entry?.type ? <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px rgba(157,107,255,.4)', color: 'var(--purple2)' }}>{entry.type.replace(/-/g, ' ')}</span> : null}
      </div>
      {entryBody ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginTop: 7 }}>{entryBody}</div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--faint)', fontStyle: 'italic', marginTop: 7 }}>No definition written yet for this term.</div>
      )}
      {entry ? <span onClick={() => { openGlossaryEntry(entry.slug); onClose(); }} style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--purple)', cursor: 'pointer' }}>Open full entry →</span> : null}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70 }} />
      <div style={{ position: 'fixed', left: x, top: y, width: 344, maxHeight: 440, overflowY: 'auto', zIndex: 71, padding: 18, borderRadius: 16, background: 'var(--card2)', boxShadow: '0 18px 50px rgba(0,0,0,.6), inset 0 0 0 1px var(--line2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--purple)' }}>Glossary · {kind}</div>
          <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--faint)' }}>✕</span>
        </div>
        {kind === 'category' ? (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22, color: 'var(--cream)', marginTop: 6 }}>{row.label}</div>
            <div style={{ fontSize: 14, color: '#b3adbf', lineHeight: 1.5, marginTop: 7 }}>{categoryBody}</div>
            <EntryBlock bordered />
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 22, color: 'var(--cream)', marginTop: 6 }}>{entry?.displayTerm || entry?.term || row.value}</div>
            {entry?.summary ? <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{entry.summary}</div> : null}
            <div style={{ marginTop: 12 }}><EntryBlock /></div>
          </>
        )}
      </div>
    </>
  );
}
