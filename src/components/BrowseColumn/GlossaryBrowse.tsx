import { useEffect, useMemo, useRef, useState } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { usePrefs } from '../../state/usePrefs';
import { useGlossary } from '../../hooks/useGlossary';
import { allEntries, entriesByType, getEntry, searchEntries, type GlossaryEntry } from '../../lib/glossary';
import { getTypeMeta } from '../../lib/glossaryTypes';

function Medallion({ entry, size = 28 }: { entry: GlossaryEntry; size?: number }) {
  const m = getTypeMeta(entry.type);
  return (
    <div style={{ width: size, height: size, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0810', boxShadow: `inset 0 0 0 1px ${m.color}66`, color: m.color, fontSize: size * 0.5 }}>
      {m.glyph}
    </div>
  );
}

function EntryRow({ entry, active, bookmarked, onOpen, onBookmark }: { entry: GlossaryEntry; active: boolean; bookmarked: boolean; onOpen: () => void; onBookmark: () => void }) {
  const m = getTypeMeta(entry.type);
  return (
    <div
      onClick={onOpen}
      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 2, background: active ? 'rgba(157,107,255,.1)' : 'transparent', boxShadow: active ? 'inset 0 0 0 1px rgba(157,107,255,.3)' : 'none' }}
    >
      <Medallion entry={entry} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, color: active ? 'var(--cream)' : '#d8d3e0', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.displayTerm || entry.term}
        </div>
        <div style={{ fontSize: 10.5, color: m.color, marginTop: 1 }}>
          {m.label}
          {entry.status === 'stub' ? <span style={{ color: 'var(--faint)' }}> · stub</span> : null}
        </div>
      </div>
      <span
        onClick={(e) => {
          e.stopPropagation();
          onBookmark();
        }}
        style={{ flex: 'none', fontSize: 14, color: bookmarked ? '#FACC15' : 'var(--faint)', cursor: 'pointer', padding: 2 }}
      >
        {bookmarked ? '★' : '☆'}
      </span>
    </div>
  );
}

function Rail({ title, entries, onOpen }: { title: string; entries: GlossaryEntry[]; onOpen: (slug: string) => void }) {
  if (!entries.length) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--purpledim)', margin: '4px 4px 6px' }}>{title}</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {entries.map((e) => {
          const m = getTypeMeta(e.type);
          return (
            <div key={e.slug} onClick={() => onOpen(e.slug)} style={{ width: 142, flex: 'none', padding: 10, borderRadius: 12, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line)', cursor: 'pointer' }}>
              <div style={{ fontFamily: 'var(--ui)', fontWeight: 600, fontSize: 13, color: 'var(--cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.displayTerm || e.term}</div>
              <div style={{ fontSize: 10.5, color: m.color, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GlossaryBrowse() {
  const ready = useGlossary();
  const selectedSlug = useOpen777((s) => s.selectedGlossarySlug);
  const openGlossaryEntry = useOpen777((s) => s.openGlossaryEntry);
  const bookmarks = usePrefs((s) => s.glossaryBookmarks);
  const recents = usePrefs((s) => s.recentGlossarySlugs);
  const toggleBookmark = usePrefs((s) => s.toggleGlossaryBookmark);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [completeOnly, setCompleteOnly] = useState(false);
  const [visible, setVisible] = useState(60);
  const listRef = useRef<HTMLDivElement>(null);

  const typeChips = useMemo(() => {
    if (!ready) return [];
    return Object.entries(entriesByType())
      .map(([type, list]) => ({ type, count: list.length }))
      .sort((a, b) => b.count - a.count);
  }, [ready]);

  const results = useMemo<GlossaryEntry[]>(() => {
    if (!ready) return [];
    let list = query.trim() ? searchEntries(query) : allEntries();
    if (typeFilter) list = list.filter((e) => e.type === typeFilter);
    if (completeOnly) list = list.filter((e) => e.status === 'complete');
    return list;
  }, [ready, query, typeFilter, completeOnly]);

  useEffect(() => setVisible(60), [query, typeFilter, completeOnly]);

  const idle = !query.trim() && !typeFilter && !completeOnly;
  const bookmarkedEntries = useMemo(() => (ready ? bookmarks.map(getEntry).filter((e): e is GlossaryEntry => !!e) : []), [ready, bookmarks]);
  const recentEntries = useMemo(() => (ready ? recents.map(getEntry).filter((e): e is GlossaryEntry => !!e) : []), [ready, recents]);

  if (!ready) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--faint)' }}>
        <span style={{ fontSize: 28, color: 'var(--purpledim)', filter: 'drop-shadow(0 0 12px var(--purple))', animation: 'o7glow 4s ease-in-out infinite' }}>✷</span>
        <span style={{ fontSize: 12 }}>Loading the corpus…</span>
      </div>
    );
  }

  const onScroll = () => {
    const el = listRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 400) setVisible((v) => Math.min(v + 60, results.length));
  };

  return (
    <>
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 40, borderRadius: 20, background: 'var(--panel)', boxShadow: 'inset 0 0 0 1px var(--line2)', padding: '0 14px', marginBottom: 10 }}>
          <span style={{ color: 'var(--faint)', fontSize: 13 }}>⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search 2,300+ correspondences" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--cream)', fontSize: 13 }} />
          {query ? <span onClick={() => setQuery('')} style={{ color: 'var(--faint)', cursor: 'pointer' }}>✕</span> : null}
        </div>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
          <Chip label="All" active={!typeFilter} color="#9d6bff" onClick={() => setTypeFilter(null)} />
          {typeChips.map(({ type, count }) => {
            const m = getTypeMeta(type);
            return <Chip key={type} label={`${m.label} ${count}`} color={m.color} active={typeFilter === type} onClick={() => setTypeFilter(typeFilter === type ? null : type)} />;
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span onClick={() => setCompleteOnly((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: completeOnly ? 'var(--purple)' : 'var(--muted)', cursor: 'pointer' }}>
            <span>{completeOnly ? '☑' : '☐'}</span> Described only
          </span>
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div ref={listRef} onScroll={onScroll} style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 26px' }}>
        {idle ? <Rail title="Bookmarked" entries={bookmarkedEntries} onOpen={openGlossaryEntry} /> : null}
        {idle ? <Rail title="Recently viewed" entries={recentEntries} onOpen={openGlossaryEntry} /> : null}
        {idle ? <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--faint)', margin: '4px 4px 8px' }}>All terms</div> : null}
        {results.slice(0, visible).map((e) => (
          <EntryRow key={e.slug || e.term} entry={e} active={e.slug === selectedSlug} bookmarked={bookmarks.includes(e.slug)} onOpen={() => openGlossaryEntry(e.slug)} onBookmark={() => toggleBookmark(e.slug)} />
        ))}
        {results.length === 0 ? <div style={{ textAlign: 'center', padding: 24, color: 'var(--faint)', fontStyle: 'italic', fontFamily: 'var(--serif2)' }}>No terms match your search.</div> : null}
      </div>
    </>
  );
}

function Chip({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <span onClick={onClick} style={{ flex: 'none', fontSize: 11, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500, background: active ? color : `${color}1F`, color: active ? '#0a0810' : color, boxShadow: active ? 'none' : `inset 0 0 0 1px ${color}55` }}>
      {label}
    </span>
  );
}
