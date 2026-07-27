import { useState } from 'react';
import type { MergedScene } from '../../lib/report/normalize';
import { formatClock, verdictTone } from '../../lib/report/normalize';
import { Card, Chip, SectionLabel } from '../ui';

/**
 * Horizontal strip of the whole working, one segment per scene, width
 * proportional to duration. Clicking seeks the audio — this is the spine that
 * ties the written record back to the recording.
 */
export function SceneTimeline({
  scenes,
  activeScene,
  onSeek,
}: {
  scenes: MergedScene[];
  activeScene: number | null;
  onSeek: (ms: number, sceneNumber: number) => void;
}) {
  const total = scenes.reduce((max, s) => Math.max(max, s.endMs ?? 0), 0);
  if (!total) return null;

  return (
    <div style={{ display: 'flex', gap: 2, height: 40, marginTop: 6 }}>
      {scenes.map((s) => {
        const start = s.startMs ?? 0;
        const end = s.endMs ?? start;
        const width = Math.max(0.5, ((end - start) / total) * 100);
        const colors = s.dominantColors.length ? s.dominantColors : null;
        return (
          <div
            key={s.sceneNumber}
            title={`${s.sceneNumber}. ${s.title} · ${formatClock(start)}–${formatClock(end)}`}
            onClick={() => onSeek(start, s.sceneNumber)}
            style={{
              width: `${width}%`,
              borderRadius: 5,
              cursor: 'pointer',
              // Scene 1 of the reference bundle has no colours at all, so the
              // fallback is the common case, not an edge case.
              background: colors
                ? `linear-gradient(160deg, ${colors.map(cssColor).join(', ')})`
                : 'var(--card2)',
              boxShadow:
                activeScene === s.sceneNumber
                  ? 'inset 0 0 0 2px var(--purple), 0 0 14px rgba(157,107,255,.45)'
                  : 'inset 0 0 0 1px var(--line2)',
              transition: 'box-shadow .2s ease',
            }}
          />
        );
      })}
    </div>
  );
}

/** Practitioners name colours ("Adonai red"), not hex — map the common ones. */
function cssColor(name: string): string {
  const n = name.toLowerCase();
  const known: Record<string, string> = {
    red: '#c1121f',
    scarlet: '#ff2400',
    blue: '#2b4bd8',
    azure: '#3a7bd5',
    green: '#34c08a',
    gold: '#d4a72c',
    amber: '#ffbf00',
    orange: '#ff7a1a',
    white: '#efeae0',
    black: '#14121a',
    grey: '#6f6a7d',
    gray: '#6f6a7d',
    purple: '#9d6bff',
    violet: '#8b5cf6',
    yellow: '#e8d44d',
    brown: '#7a5236',
    pink: '#e08fb0',
    silver: '#c9c6d4',
  };
  for (const [key, hex] of Object.entries(known)) if (n.includes(key)) return hex;
  if (/^#[0-9a-f]{3,8}$/i.test(name.trim())) return name.trim();
  return 'var(--card2)';
}

function VerdictBadge({ scene }: { scene: MergedScene }) {
  const tone = verdictTone(scene.verdict);
  if (!tone) return null;
  return (
    <Chip tone={tone.color} title="Result of the adversarial faithfulness audit">
      {tone.label}
    </Chip>
  );
}

function SceneCard({
  scene,
  active,
  onSeek,
}: {
  scene: MergedScene;
  active: boolean;
  onSeek: (ms: number, sceneNumber: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const piece = scene.piece;
  const showFull = expanded || active;

  return (
    <Card active={active} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span
          onClick={() => onSeek(scene.startMs ?? 0, scene.sceneNumber)}
          title="Play from here"
          style={{ fontSize: 12, color: 'var(--purple2)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          ▶ {formatClock(scene.startMs)}–{formatClock(scene.endMs)}
        </span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--cream)' }}>
          {scene.sceneNumber}. {scene.title}
        </span>
        <VerdictBadge scene={scene} />
      </div>

      {scene.mood || scene.dominantColors.length || scene.keySymbols.length ? (
        <div style={{ display: 'flex', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
          {scene.mood ? <Chip>{scene.mood}</Chip> : null}
          {scene.dominantColors.map((c) => (
            <Chip key={c} tone={cssColor(c)}>
              {c}
            </Chip>
          ))}
          {scene.keySymbols.slice(0, 6).map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      ) : null}

      {scene.summary ? (
        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 11, lineHeight: 1.6 }}>
          {scene.summary}
        </div>
      ) : null}

      {piece?.piece ? (
        <>
          <div
            style={{
              fontFamily: 'var(--serif2)',
              fontSize: 16.5,
              lineHeight: 1.68,
              color: 'var(--cream)',
              marginTop: 14,
              maxHeight: showFull ? undefined : 132,
              overflow: showFull ? undefined : 'hidden',
              position: 'relative',
              maskImage: showFull ? undefined : 'linear-gradient(180deg,#000 60%,transparent)',
              WebkitMaskImage: showFull ? undefined : 'linear-gradient(180deg,#000 60%,transparent)',
            }}
          >
            {piece.piece}
          </div>
          {!active ? (
            <div
              onClick={() => setExpanded((v) => !v)}
              style={{ fontSize: 12, color: 'var(--purple2)', cursor: 'pointer', marginTop: 8 }}
            >
              {expanded ? 'Collapse' : 'Read the full piece'}
            </div>
          ) : null}
        </>
      ) : null}

      {/* Corrections sit directly under the prose: this is a trust surface,
          not a footnote. The pipeline never silently rewrites a mishearing. */}
      {piece?.transcriptCorrections?.length ? (
        <div style={{ marginTop: 14 }}>
          <SectionLabel style={{ margin: '0 0 7px' }}>Heard → probable</SectionLabel>
          <div style={{ display: 'grid', gap: 5 }}>
            {piece.transcriptCorrections.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'baseline', fontSize: 12.5, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--dim)', fontFamily: 'var(--serif2)', fontStyle: 'italic' }}>
                  “{c.heard}”
                </span>
                <span style={{ color: 'var(--faint)' }}>→</span>
                <span style={{ color: 'var(--cream)' }}>{c.probable}</span>
                <Chip tone={c.confidence === 'high' ? '#34c08a' : c.confidence === 'medium' ? '#b9a44a' : '#7d7790'}>
                  {c.confidence}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {piece?.entities?.length ? (
        <div style={{ marginTop: 14 }}>
          <SectionLabel style={{ margin: '0 0 7px' }}>Encountered</SectionLabel>
          {piece.entities.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: 'var(--cream)' }}>{e.name}</span>
                {e.kind ? <Chip>{e.kind}</Chip> : null}
                {e.evidence === 'inferred' ? <Chip tone="#7d7790">inferred</Chip> : null}
                {e.engagementType ? <Chip tone="#9d6bff">{e.engagementType}</Chip> : null}
              </div>
              {e.description ? (
                <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 4, lineHeight: 1.55 }}>
                  {e.description}
                </div>
              ) : null}
              {/* Whether a tested entity remained is load-bearing for the
                  practitioner — surface it, never bury it. */}
              {e.banishingTest ? (
                <div style={{ fontSize: 12.5, color: 'var(--info-text)', marginTop: 4 }}>
                  ⌖ {e.banishingTest}
                </div>
              ) : null}
              {e.dialogues?.map((d, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: 'var(--serif2)',
                    fontStyle: 'italic',
                    fontSize: 14,
                    marginTop: 5,
                    paddingLeft: 10,
                    boxShadow: `inset 2px 0 0 ${d.speaker === 'entity' ? 'var(--purpledim)' : 'var(--line2)'}`,
                    color: d.speaker === 'entity' ? 'var(--purple2)' : 'var(--muted)',
                  }}
                >
                  {d.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {piece?.ritualActions?.length ? (
        <div style={{ marginTop: 14 }}>
          <SectionLabel style={{ margin: '0 0 7px' }}>Ritual actions</SectionLabel>
          <div style={{ display: 'grid', gap: 8 }}>
            {piece.ritualActions.map((r) => (
              <div key={r.id} style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  {r.form ? <Chip tone="#9d6bff">{r.form}</Chip> : null}
                  {r.category ? <Chip>{r.category}</Chip> : null}
                  {r.godNamesUsed?.map((g) => (
                    <Chip key={g} tone="#d4a72c">
                      {g}
                    </Chip>
                  ))}
                </div>
                {r.detail ? <div style={{ marginTop: 5, lineHeight: 1.55 }}>{r.detail}</div> : null}
                {r.validationNote ? (
                  <div style={{ color: 'var(--dim)', marginTop: 3, lineHeight: 1.5 }}>{r.validationNote}</div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {piece?.verification?.issues?.length ? (
        <VerificationIssues verification={piece.verification} />
      ) : null}

      {piece?.archetypalNotes ? (
        <div style={{ marginTop: 14 }}>
          <SectionLabel style={{ margin: '0 0 7px' }}>Archetypal reading</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.62 }}>{piece.archetypalNotes}</div>
        </div>
      ) : null}
    </Card>
  );
}

function VerificationIssues({ verification }: { verification: NonNullable<MergedScene['piece']>['verification'] }) {
  const [open, setOpen] = useState(false);
  if (!verification) return null;
  // Non-confirmed statuses float to the top — those are the ones that matter.
  const issues = [...verification.issues].sort((a, b) =>
    a.status === 'confirmed' ? 1 : b.status === 'confirmed' ? -1 : 0,
  );
  return (
    <div style={{ marginTop: 14 }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 12, color: 'var(--purple2)', cursor: 'pointer' }}
      >
        {open ? '▾' : '▸'} Faithfulness audit · {issues.length} claim{issues.length === 1 ? '' : 's'} checked
      </div>
      {open ? (
        <div style={{ display: 'grid', gap: 7, marginTop: 8 }}>
          {issues.map((i, idx) => (
            <div key={idx} style={{ fontSize: 12.5 }}>
              <Chip
                tone={
                  i.status === 'confirmed' ? '#34c08a' : i.status === 'unsupported' ? '#b9a44a' : '#e0464b'
                }
              >
                {i.status}
              </Chip>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{i.claim}</span>
              {i.note ? (
                <div style={{ color: 'var(--dim)', marginTop: 3, lineHeight: 1.5 }}>{i.note}</div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SceneSection({
  scenes,
  activeScene,
  onSeek,
}: {
  scenes: MergedScene[];
  activeScene: number | null;
  onSeek: (ms: number, sceneNumber: number) => void;
}) {
  return (
    <div>
      <SectionLabel>The journey, scene by scene</SectionLabel>
      <SceneTimeline scenes={scenes} activeScene={activeScene} onSeek={onSeek} />
      <div style={{ marginTop: 16 }}>
        {scenes.map((s) => (
          <SceneCard key={s.sceneNumber} scene={s} active={activeScene === s.sceneNumber} onSeek={onSeek} />
        ))}
      </div>
    </div>
  );
}
