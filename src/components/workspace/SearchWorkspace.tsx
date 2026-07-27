import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/api';
import type { EntityEntry, MotifEntry, SearchHit, SearchResponse } from '../../lib/apiTypes';
import { useOpen777 } from '../../state/useOpen777';
import { Card, Chip, EmptyState, Highlight, SearchField, SectionLabel } from '../ui';

type Scope = 'all' | 'transcripts' | 'reports' | 'motifs' | 'correspondences';

const SCOPES: Array<{ key: Scope; label: string; kinds?: string }> = [
  { key: 'all', label: 'Everything' },
  { key: 'transcripts', label: 'Transcripts', kinds: 'transcript' },
  { key: 'reports', label: 'Readings', kinds: 'scene_piece,archetype,crossref_summary,theme' },
  { key: 'motifs', label: 'Motifs' },
  { key: 'correspondences', label: 'Correspondences' },
];

const KIND_LABEL: Record<string, string> = {
  transcript: 'transcript',
  scene_piece: 'scene',
  archetype: 'reading',
  crossref_summary: 'X-Ray',
  entity: 'being',
  motif: 'motif',
  moodboard_item: 'object',
  theme: 'theme',
};

/**
 * Search across everything the practitioner has recorded.
 *
 * Four modes behind one field: full-text over transcripts and readings, the
 * cross-session motif index, the entity index, and correspondence lookup. The
 * facet counts double as a map of where the matches live.
 */
export default function SearchWorkspace() {
  const initialQuery = useOpen777((s) => s.searchQuery);
  const initialScope = useOpen777((s) => s.searchScope) as Scope;
  const setSelectedRecording = useOpen777((s) => s.setSelectedRecording);
  const setMode = useOpen777((s) => s.setMode);

  const [q, setQ] = useState(initialQuery);
  const [scope, setScope] = useState<Scope>(initialScope ?? 'all');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [motifs, setMotifs] = useState<MotifEntry[]>([]);
  const [entities, setEntities] = useState<EntityEntry[]>([]);
  const [correspondences, setCorrespondences] = useState<
    Array<{ liber777Row: string; matched: number; unmatched: number; pathNumbers: number[] }>
  >([]);
  const [busy, setBusy] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carry a query in from a motif chip or a 777 row badge.
  useEffect(() => {
    if (initialQuery) setQ(initialQuery);
    if (initialScope) setScope(initialScope as Scope);
  }, [initialQuery, initialScope]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    // 250 ms: typing eight characters must fire ~1 request, not eight.
    debounce.current = setTimeout(() => {
      let cancelled = false;
      setBusy(true);
      const kinds = SCOPES.find((s) => s.key === scope)?.kinds;

      const run = async () => {
        try {
          if (scope === 'motifs') {
            const [m, e] = await Promise.all([
              api.motifs({ q, limit: 60 }),
              api.entities({ q, limit: 60 }),
            ]);
            if (cancelled) return;
            setMotifs(m.motifs);
            setEntities(e.entities);
            setData(null);
          } else if (scope === 'correspondences') {
            const c = await api.correspondenceCoverage();
            if (cancelled) return;
            const needle = q.trim().toLowerCase();
            setCorrespondences(
              c.coverage.filter((r) => !needle || r.liber777Row.toLowerCase().includes(needle)),
            );
            setData(null);
          } else {
            const r = await api.search({ q, kind: kinds, limit: 30 });
            if (cancelled) return;
            setData(r);
          }
        } catch {
          if (!cancelled) setData(null);
        } finally {
          if (!cancelled) setBusy(false);
        }
      };
      void run();
      return () => {
        cancelled = true;
      };
    }, 250);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [q, scope]);

  const open = (hit: SearchHit) => {
    setSelectedRecording(hit.recordingId);
    setMode('myrecords');
  };

  const facetPaths = useMemo(
    () =>
      Object.entries(data?.facets.byPath ?? {})
        .map(([p, n]) => ({ path: Number(p), n }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 12),
    [data],
  );

  return (
    <div style={{ padding: 26, maxWidth: 1040 }}>
      <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
        Search your scrying
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--cream)', margin: '6px 0 14px' }}>
        Everything you have witnessed
      </div>

      <SearchField value={q} onChange={setQ} placeholder="A being, a colour, a phrase, a correspondence…" />

      <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
        {SCOPES.map((s) => (
          <Chip key={s.key} active={scope === s.key} onClick={() => setScope(s.key)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {busy ? <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 12 }}>Searching…</div> : null}

      {/* ── Full-text ── */}
      {data ? (
        <>
          <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
            {Object.entries(data.facets.byKind).map(([kind, n]) => (
              <Chip key={kind}>
                {KIND_LABEL[kind] ?? kind} · {n}
              </Chip>
            ))}
          </div>
          {facetPaths.length > 1 ? (
            <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
              {facetPaths.map((f) => (
                <Chip key={f.path} tone="#9d6bff">
                  Path {f.path} · {f.n}
                </Chip>
              ))}
            </div>
          ) : null}

          <SectionLabel>{data.results.length} result{data.results.length === 1 ? '' : 's'}</SectionLabel>
          {data.results.length === 0 ? (
            <EmptyState glyph="⌕" title="Nothing found" subtitle="Try a different word, or widen the scope." />
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {data.results.map((hit, i) => (
                <Card key={`${hit.recordingId}-${i}`} onClick={() => open(hit)} style={{ padding: 14 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <Chip tone="#9d6bff">{KIND_LABEL[hit.kind] ?? hit.kind}</Chip>
                    <span style={{ fontSize: 14, color: 'var(--cream)' }}>{hit.title}</span>
                    {hit.pathNumber !== null ? (
                      <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>Path {hit.pathNumber}</span>
                    ) : null}
                    {hit.recordedAt ? (
                      <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>
                        {new Date(hit.recordedAt).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                  {hit.snippet.text ? (
                    <div
                      style={{
                        fontFamily: 'var(--serif2)',
                        fontSize: 14.5,
                        lineHeight: 1.62,
                        color: 'var(--muted)',
                        marginTop: 7,
                      }}
                    >
                      {/* Offsets, never HTML — the corpus is user speech. */}
                      <Highlight text={hit.snippet.text} highlights={hit.snippet.highlights} />
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </>
      ) : null}

      {/* ── Motif / entity index ── */}
      {scope === 'motifs' ? (
        <>
          <SectionLabel>Motifs across your sessions</SectionLabel>
          {motifs.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--faint)' }}>No motifs recorded yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 9 }}>
              {motifs.map((m) => (
                <Card key={m.motifKey} style={{ padding: 13 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, color: 'var(--cream)' }}>{m.label}</span>
                    <Chip tone={m.sessionCount > 1 ? '#9d6bff' : undefined}>
                      {m.sessionCount} session{m.sessionCount === 1 ? '' : 's'}
                    </Chip>
                    {m.pathNumbers.map((p) => (
                      <Chip key={p}>Path {p}</Chip>
                    ))}
                  </div>
                  {m.note ? (
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.55 }}>
                      {m.note}
                    </div>
                  ) : null}
                  {m.recurrenceHint ? (
                    <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>↻ {m.recurrenceHint}</div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}

          {entities.length > 0 ? (
            <>
              <SectionLabel>Beings & objects</SectionLabel>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {entities.map((e) => (
                  <Chip key={e.nameKey} title={e.description ?? undefined}>
                    {e.label}
                    {e.sessionCount > 1 ? ` ×${e.sessionCount}` : ''}
                  </Chip>
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {/* ── Correspondence coverage ── */}
      {scope === 'correspondences' ? (
        <>
          <SectionLabel>Your Liber 777 coverage</SectionLabel>
          {correspondences.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--faint)' }}>
              No correspondences recorded yet — complete a reading first.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 7 }}>
              {correspondences.map((r) => (
                <div
                  key={r.liber777Row}
                  style={{ display: 'flex', gap: 9, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 12.5 }}
                >
                  <span style={{ color: 'var(--purple2)', fontSize: 11, minWidth: 220 }}>{r.liber777Row}</span>
                  {r.matched > 0 ? <Chip tone="#34c08a">witnessed ×{r.matched}</Chip> : null}
                  {r.unmatched > 0 ? <Chip tone="#7d7790">unmet ×{r.unmatched}</Chip> : null}
                  {r.pathNumbers.map((p) => (
                    <Chip key={p}>Path {p}</Chip>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
