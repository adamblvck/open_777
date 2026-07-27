import { useMemo } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { byCategory } from '../../data/referenceAdapter';
import { EL, type Element } from '../../theme';
import type { Category, Entry } from '../../data/models';

const CATS: Array<[Category, string]> = [
  ['spheres', 'Spheres'],
  ['paths', 'Paths'],
  ['planets', 'Planets'],
  ['zodiac', 'Zodiac'],
];

function searchText(e: Entry): string {
  if (e.type === 'sphere') return [e.title, e.he, e.meaning].join(' ');
  if (e.type === 'path') return [e.title, e.he, e.trump, e.attr].join(' ');
  if (e.type === 'planet') return [e.title, e.he, e.sphere, e.metal].join(' ');
  return [e.title, e.he, e.element, e.quality, e.ruler].join(' ');
}
function subLine(e: Entry): string {
  if (e.type === 'sphere') return `${e.meaning} · ${e.num} · ${e.sphere.split(' (')[0]}`;
  if (e.type === 'path') return `${e.num} · ${e.trump} · ${e.attr}`;
  if (e.type === 'planet') return `${e.sphere} · ${e.metal}`;
  return `${e.element} · ${e.quality} · ${e.ruler}`;
}
function glyphOf(e: Entry): string | number {
  if (e.type === 'sphere') return e.num;
  if (e.type === 'path') return e.he;
  return e.glyph;
}
function dotOf(e: Entry): string {
  if (e.type === 'sphere') return e.color;
  if (e.type === 'zodiac') return EL[e.element as Element]?.c || '#9d6bff';
  return '#9d6bff';
}

export default function ReferenceBrowse() {
  const query = useOpen777((s) => s.query);
  const category = useOpen777((s) => s.category);
  const selectedId = useOpen777((s) => s.selectedId);
  const setQuery = useOpen777((s) => s.setQuery);
  const setCategory = useOpen777((s) => s.setCategory);
  const selectEntry = useOpen777((s) => s.selectEntry);

  const entries = useMemo(() => {
    let pool = byCategory(category);
    const q = query.trim().toLowerCase();
    if (q) pool = pool.filter((e) => searchText(e).toLowerCase().includes(q));
    return pool;
  }, [category, query]);

  return (
    <>
      <div style={{ padding: '16px 24px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            height: 42,
            borderRadius: 21,
            background: 'var(--panel)',
            boxShadow: 'inset 0 0 0 1px var(--line2)',
            padding: '0 16px',
            marginBottom: 16,
          }}
        >
          <span style={{ color: 'var(--faint)', fontSize: 14 }}>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the correspondences"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--cream)', fontSize: 13.5 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
          {CATS.map(([key, label]) => {
            const active = category === key;
            return (
              <span
                key={key}
                onClick={() => setCategory(key)}
                style={{
                  fontSize: 11.5,
                  padding: '6px 13px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  background: active ? 'var(--purple)' : 'transparent',
                  color: active ? '#0a0810' : 'var(--muted)',
                  boxShadow: active ? 'none' : 'inset 0 0 0 1px var(--line2)',
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 26px' }}>
        {entries.map((e) => {
          const active = e.id === selectedId;
          return (
            <div
              key={e.id}
              onClick={() => selectEntry(e.id)}
              style={{
                display: 'flex',
                gap: 13,
                alignItems: 'center',
                padding: '11px 12px',
                borderRadius: 13,
                cursor: 'pointer',
                marginBottom: 3,
                transition: 'background .15s',
                background: active ? 'rgba(157,107,255,.1)' : 'transparent',
                boxShadow: active ? 'inset 0 0 0 1px rgba(157,107,255,.3)' : 'none',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  flex: 'none',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0a0810',
                  boxShadow: 'inset 0 0 0 1px var(--line2)',
                  color: dotOf(e),
                  fontSize: 16,
                }}
              >
                <span>{glyphOf(e)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: 'var(--serif)',
                      fontWeight: 600,
                      fontSize: 18,
                      lineHeight: 1.05,
                      color: active ? 'var(--cream)' : '#d8d3e0',
                    }}
                  >
                    {e.title}
                  </span>
                  <span style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--dim)', direction: 'rtl' }}>
                    {e.he}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--faint)',
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {subLine(e)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
