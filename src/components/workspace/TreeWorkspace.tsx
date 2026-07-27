import { useEffect, useMemo, useState } from 'react';
import TreeOfLife from '../TreeOfLife';
import { api } from '../../lib/api';
import type { PathAggregate, TreeStats } from '../../lib/apiTypes';
import { useOpen777 } from '../../state/useOpen777';
import { Card, Chip, EmptyState, SectionLabel } from '../ui';
import { scoreTone } from '../../lib/report/normalize';
import { pathsTouchingSephira } from '../../lib/pathMapping';

/**
 * The Tree of Life as a map of the practitioner's own working.
 *
 * Heat encodes two things at once: opacity is how often a path has been walked,
 * hue is the mean Open777 fidelity of those workings. Unwalked paths stay
 * faintly drawn, so the glyph always reads as a map of where you have *not*
 * been — which is the motivating view.
 */
export default function TreeWorkspace() {
  const [stats, setStats] = useState<TreeStats | null>(null);
  const [aggregate, setAggregate] = useState<PathAggregate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedPath = useOpen777((s) => s.treePath);
  const setTreePath = useOpen777((s) => s.setTreePath);
  const setSelectedRecording = useOpen777((s) => s.setSelectedRecording);
  const setMode = useOpen777((s) => s.setMode);

  useEffect(() => {
    let cancelled = false;
    api
      .tree()
      .then((t) => !cancelled && setStats(t))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load the Tree'));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedPath === null) {
      setAggregate(null);
      return;
    }
    let cancelled = false;
    api
      .treePath(selectedPath)
      .then((a) => !cancelled && setAggregate(a))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedPath]);

  const { pathColors, pathOpacity, byNumber } = useMemo(() => {
    const byNumber = new Map((stats?.paths ?? []).map((p) => [p.pathNumber, p]));
    const maxSessions = Math.max(1, ...(stats?.paths ?? []).map((p) => p.sessionCount));
    const pathColors: Record<number, string> = {};
    const pathOpacity: Record<number, number> = {};
    for (const p of stats?.paths ?? []) {
      pathColors[p.pathNumber] =
        p.sessionCount === 0 ? '#2a2733' : scoreTone(p.avgMatchScore).color;
      // Never fully invisible: an unwalked path is information too.
      pathOpacity[p.pathNumber] =
        p.sessionCount === 0 ? 0.18 : 0.45 + 0.55 * (p.sessionCount / maxSessions);
    }
    return { pathColors, pathOpacity, byNumber };
  }, [stats]);

  const selected = selectedPath ? byNumber.get(selectedPath) ?? null : null;

  if (error) {
    return <EmptyState glyph="✗" title="The Tree could not be loaded" subtitle={error} />;
  }
  if (!stats) {
    return <EmptyState glyph="✷" title="Reading the Tree…" />;
  }

  const walked = stats.paths.filter((p) => p.sessionCount > 0).length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,440px) 1fr', gap: 22, padding: 26, alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
          Your Tree
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--cream)', margin: '6px 0 4px' }}>
          {walked} of 22 paths walked
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--dim)' }}>
          Brightness is how often you have walked a path; colour is how closely those workings matched
          Liber 777.
        </div>

        <div style={{ display: 'grid', placeItems: 'center', margin: '18px 0' }}>
          <TreeOfLife
            height={380}
            radiusSephira={13}
            showAllPaths
            pathColors={pathColors}
            pathOpacity={pathOpacity}
            selected={selectedPath ? [selectedPath] : []}
            onSelectPath={(n) => setTreePath(n === selectedPath ? null : n)}
            onSelectSephira={(n) => {
              // A sephira has no sessions of its own here; jump to the first
              // path touching it that has been walked.
              const candidates = pathsTouchingSephira(n).filter((p) => (byNumber.get(p)?.sessionCount ?? 0) > 0);
              if (candidates.length) setTreePath(candidates[0]!);
            }}
            pathTitle={(n) => {
              const p = byNumber.get(n);
              if (!p) return `Path ${n}`;
              return `Path ${n} · ${p.letterTranslit ?? ''} ${p.trump ?? ''} — ${p.sessionCount} session${p.sessionCount === 1 ? '' : 's'}${p.avgMatchScore ? `, avg ${Math.round(p.avgMatchScore)}/100` : ''}`;
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <Chip tone="#34c08a">strongly on-signature</Chip>
          <Chip tone="#b9a44a">partly</Chip>
          <Chip tone="#e0464b">off-signature</Chip>
          <Chip tone="#7d7790">not walked</Chip>
        </div>
        {stats.unplacedCount > 0 ? (
          <Card style={{ marginTop: 14, padding: 12 }}>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {stats.unplacedCount} recording{stats.unplacedCount === 1 ? '' : 's'} sit outside the glyph
              (path 0 “General”). They are kept, just not placed.
            </div>
          </Card>
        ) : null}
      </div>

      <div style={{ minWidth: 0 }}>
        {!selected ? (
          <EmptyState
            glyph="⯑"
            title="Choose a path"
            subtitle="Click any path on the Tree to see every working you have recorded there."
          />
        ) : (
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
              Path {selected.pathNumber} · {selected.letterTranslit} {selected.letterMeaning ? `“${selected.letterMeaning}”` : ''}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 27, color: 'var(--cream)', margin: '5px 0 10px' }}>
              {selected.trump ?? `Path ${selected.pathNumber}`}
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {selected.attribution ? <Chip>{selected.attribution}</Chip> : null}
              {selected.intelligence ? <Chip>{selected.intelligence}</Chip> : null}
              {selected.fromSephira && selected.toSephira ? (
                <Chip>
                  {selected.fromSephira} → {selected.toSephira}
                </Chip>
              ) : null}
              <Chip tone={scoreTone(selected.avgMatchScore).color}>
                {selected.sessionCount} session{selected.sessionCount === 1 ? '' : 's'}
                {selected.avgMatchScore ? ` · avg ${Math.round(selected.avgMatchScore)}/100` : ''}
              </Chip>
            </div>

            {aggregate?.sessions?.length ? (
              <>
                <SectionLabel>Your workings</SectionLabel>
                <div style={{ display: 'grid', gap: 9 }}>
                  {aggregate.sessions.map((s) => (
                    <Card
                      key={s.recordingId}
                      style={{ padding: 13 }}
                      onClick={() => {
                        setSelectedRecording(s.recordingId);
                        setMode('myrecords');
                      }}
                    >
                      <div style={{ display: 'flex', gap: 9, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, color: 'var(--cream)' }}>
                          {s.recordedAt ? new Date(s.recordedAt).toLocaleDateString() : 'undated'}
                        </span>
                        {s.durationMs ? (
                          <span style={{ fontSize: 12, color: 'var(--dim)' }}>
                            {Math.round(s.durationMs / 60000)} min
                          </span>
                        ) : null}
                        {s.matchScore !== null ? (
                          <Chip tone={scoreTone(s.matchScore).color}>{Math.round(s.matchScore)}/100</Chip>
                        ) : (
                          <Chip tone="#7d7790">{s.status}</Chip>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : null}

            {aggregate?.motifs?.length ? (
              <>
                <SectionLabel>Recurring motifs on this path</SectionLabel>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {aggregate.motifs.map((m) => (
                    <Chip key={m.motifKey} tone={m.sessionCount > 1 ? '#9d6bff' : undefined}>
                      {m.label}
                      {m.sessionCount > 1 ? ` ×${m.sessionCount}` : ''}
                    </Chip>
                  ))}
                </div>
              </>
            ) : null}

            {aggregate?.witnessed?.length ? (
              <>
                <SectionLabel>Correspondences you have witnessed</SectionLabel>
                <div style={{ display: 'grid', gap: 8 }}>
                  {aggregate.witnessed.map((w) => (
                    <div key={w.liber777Row ?? Math.random()} style={{ fontSize: 12.5 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--purple2)', fontSize: 11 }}>{w.liber777Row}</span>
                        {w.timesWitnessed > 1 ? <Chip tone="#34c08a">×{w.timesWitnessed}</Chip> : null}
                      </div>
                      {w.expected ? (
                        <div style={{ color: 'var(--muted)', marginTop: 3 }}>{w.expected}</div>
                      ) : null}
                      {w.exampleQuote ? (
                        <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', color: 'var(--dim)', marginTop: 3 }}>
                          “{w.exampleQuote}”
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {aggregate?.stillUnmatched?.length ? (
              <>
                <SectionLabel>Still unmet on this path</SectionLabel>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {aggregate.stillUnmatched.slice(0, 30).map((u) => (
                    <Chip key={u.liber777Row ?? Math.random()} title={u.expected ?? undefined}>
                      {u.liber777Row}
                    </Chip>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
