import type { ReportArchetypes, ReportMoodboard } from '../../lib/apiTypes';
import { Card, Chip, SectionLabel } from '../ui';

/**
 * Archetypes — the whole-journey reading.
 *
 * `personalMotifs` is the payoff: named entities and recurring objects that
 * belong to this practitioner rather than the tradition. They are the seeds of
 * their own correspondence tree, so each chip deep-links into motif search.
 */
export function ArchetypesPanel({
  archetypes,
  onMotif,
}: {
  archetypes: ReportArchetypes;
  onMotif?: (motif: string) => void;
}) {
  return (
    <div>
      {archetypes.coreThemes.length > 0 ? (
        <>
          <SectionLabel>Core themes</SectionLabel>
          <div style={{ display: 'grid', gap: 10 }}>
            {archetypes.coreThemes.map((t) => (
              <Card key={t.id}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--cream)' }}>{t.name}</div>
                {t.description ? (
                  <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 7, lineHeight: 1.6 }}>
                    {t.description}
                  </div>
                ) : null}
                {t.transcriptEvidence ? (
                  <div
                    style={{
                      fontFamily: 'var(--serif2)',
                      fontStyle: 'italic',
                      fontSize: 14.5,
                      color: 'var(--purple2)',
                      marginTop: 9,
                      paddingLeft: 11,
                      boxShadow: 'inset 2px 0 0 var(--purpledim)',
                      lineHeight: 1.6,
                    }}
                  >
                    {t.transcriptEvidence}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {archetypes.personalMotifs.length > 0 ? (
        <>
          <SectionLabel>Seeds of your own Open777</SectionLabel>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
            {archetypes.personalMotifs.map((m) => (
              <Chip
                key={m.id}
                tone="#9d6bff"
                onClick={onMotif ? () => onMotif(m.motif) : undefined}
                title={onMotif ? 'Find every session where this appears' : undefined}
              >
                {m.motif}
              </Chip>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 9 }}>
            {archetypes.personalMotifs.map((m) => (
              <div key={m.id} style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--cream)' }}>{m.motif}</span>
                {m.note ? <> — {m.note}</> : null}
                {m.recurrenceHint ? (
                  <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>
                    ↻ {m.recurrenceHint}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {archetypes.jungianReading || archetypes.hermeticReading ? (
        <>
          <SectionLabel>Two readings</SectionLabel>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
            {archetypes.hermeticReading ? (
              <Card>
                <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
                  Hermetic
                </div>
                <div style={{ fontFamily: 'var(--serif2)', fontSize: 15.5, lineHeight: 1.68, color: 'var(--muted)', marginTop: 9, whiteSpace: 'pre-wrap' }}>
                  {archetypes.hermeticReading}
                </div>
              </Card>
            ) : null}
            {archetypes.jungianReading ? (
              <Card>
                <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
                  Depth-psychological
                </div>
                <div style={{ fontFamily: 'var(--serif2)', fontSize: 15.5, lineHeight: 1.68, color: 'var(--muted)', marginTop: 9, whiteSpace: 'pre-wrap' }}>
                  {archetypes.jungianReading}
                </div>
              </Card>
            ) : null}
          </div>
        </>
      ) : null}

      {archetypes.integrationSuggestions?.length ? (
        <>
          <SectionLabel>Integration</SectionLabel>
          <div style={{ display: 'grid', gap: 7 }}>
            {archetypes.integrationSuggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--purpledim)' }}>◆</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Mood board — the strata bar and swatch grid ported from moodboard.html. */
export function MoodboardPanel({ moodboard }: { moodboard: ReportMoodboard }) {
  const palette = moodboard.palette ?? [];
  return (
    <div>
      {moodboard.atmosphere ? (
        <div style={{ fontFamily: 'var(--serif2)', fontSize: 16, lineHeight: 1.68, color: 'var(--muted)', marginBottom: 18 }}>
          {moodboard.atmosphere}
        </div>
      ) : null}

      {palette.length > 0 ? (
        <>
          {/* Strata bar: the vision's colours in narrative order. */}
          <div style={{ display: 'flex', height: 54, borderRadius: 12, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
            {palette.map((p) => (
              <div
                key={p.id}
                title={`${p.name}${p.hex ? ` · ${p.hex}` : ''}`}
                style={{ flex: 1, background: p.hex ?? 'var(--card2)' }}
              />
            ))}
          </div>

          <SectionLabel>Palette of the vision</SectionLabel>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
            {palette.map((p) => (
              <Card key={p.id} style={{ padding: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: p.hex ?? 'var(--card2)',
                      boxShadow: 'inset 0 0 0 1px var(--line2)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--cream)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--faint)', fontFamily: 'monospace' }}>{p.hex}</div>
                  </div>
                </div>
                {p.source ? (
                  <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--dim)', marginTop: 8 }}>
                    “{p.source}”
                  </div>
                ) : null}
                {p.liber777Match ? (
                  <div style={{ marginTop: 8 }}>
                    <Chip tone="#9d6bff">777 · {p.liber777Match}</Chip>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {moodboard.items?.length ? (
        <>
          <SectionLabel>Items, beings & objects</SectionLabel>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
            {moodboard.items.map((i) => (
              <Card key={i.id} style={{ padding: 13 }}>
                <div style={{ display: 'flex', gap: 7, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: 'var(--cream)' }}>{i.name}</span>
                  {i.kind ? <Chip>{i.kind}</Chip> : null}
                  {i.salience === 'high' ? <Chip tone="#d4a72c">high</Chip> : null}
                </div>
                {i.characteristics ? (
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.55 }}>
                    {i.characteristics}
                  </div>
                ) : null}
                {i.sourceQuote ? (
                  <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 12.5, color: 'var(--dim)', marginTop: 6 }}>
                    “{i.sourceQuote}”
                  </div>
                ) : null}
                {i.sceneRefs?.length ? (
                  <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 6 }}>
                    scenes {i.sceneRefs.join(', ')}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {moodboard.texturePrompts?.length ? (
        <>
          <SectionLabel>Texture prompts</SectionLabel>
          <div style={{ display: 'grid', gap: 8 }}>
            {moodboard.texturePrompts.map((t, i) => (
              <Card key={i} style={{ padding: 12 }}>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55 }}>{t}</div>
                <div
                  onClick={() => void navigator.clipboard?.writeText(t)}
                  style={{ fontSize: 11, color: 'var(--purple2)', cursor: 'pointer', marginTop: 6 }}
                >
                  Copy prompt
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
