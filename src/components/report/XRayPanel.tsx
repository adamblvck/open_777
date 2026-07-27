import { useState } from 'react';
import type { CorrespondenceObservation, ReportCrossref } from '../../lib/apiTypes';
import { confidenceTone, scoreTone } from '../../lib/report/normalize';
import { Card, Chip, SectionLabel } from '../ui';

/** SVG arc dial for the 0-100 fidelity score. */
export function MatchScoreDial({ score, size = 132 }: { score: number | null; size?: number }) {
  const tone = scoreTone(score);
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line2)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone.color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          style={{ transition: 'stroke-dasharray .6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 34, color: 'var(--cream)', lineHeight: 1 }}>
            {score === null ? '—' : Math.round(score)}
          </div>
          <div style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--faint)', marginTop: 3 }}>
            / 100
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'matched', label: 'Witnessed' },
  { key: 'unmatched', label: 'Expected, not seen' },
  { key: 'unexpected', label: 'Off-path signals' },
] as const;

function ObservationRow({
  o,
  onRow,
}: {
  o: CorrespondenceObservation;
  onRow?: (row: string) => void;
}) {
  return (
    <div style={{ padding: '12px 0', boxShadow: 'inset 0 -1px 0 var(--line)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        {o.liber777Row ? (
          <span
            onClick={onRow ? () => onRow(o.liber777Row!) : undefined}
            title="Find every session that witnessed this correspondence"
            style={{
              fontSize: 11,
              letterSpacing: '.06em',
              color: 'var(--purple2)',
              cursor: onRow ? 'pointer' : undefined,
              textDecoration: onRow ? 'underline dotted' : undefined,
            }}
          >
            {o.liber777Row}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--faint)' }}>{o.category ?? 'element'}</span>
        )}
        {o.confidence ? (
          <Chip tone={confidenceTone(o.confidence)}>{o.confidence}</Chip>
        ) : null}
      </div>

      {o.expected ? (
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 5 }}>
          <span style={{ color: 'var(--faint)' }}>expected — </span>
          {o.expected}
        </div>
      ) : null}
      {o.witnessed ? (
        <div style={{ fontSize: 13, color: 'var(--cream)', marginTop: 4 }}>
          <span style={{ color: 'var(--faint)' }}>witnessed — </span>
          {o.witnessed}
        </div>
      ) : null}
      {o.sourceQuote ? (
        <div
          style={{
            fontFamily: 'var(--serif2)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--purple2)',
            marginTop: 6,
            paddingLeft: 10,
            boxShadow: 'inset 2px 0 0 var(--purpledim)',
          }}
        >
          “{o.sourceQuote}”
        </div>
      ) : null}
      {o.explanation ? (
        <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 6, lineHeight: 1.55 }}>
          {o.explanation}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The Open777 X-Ray — the hero of the report.
 *
 * Rendered above the scenes because it answers the practitioner's first
 * question: how on-signature was this working?
 */
export default function XRayPanel({
  crossref,
  onRow,
}: {
  crossref: ReportCrossref;
  onRow?: (row: string) => void;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('matched');
  const tone = scoreTone(crossref.matchScore);

  const lists: Record<string, CorrespondenceObservation[]> = {
    matched: crossref.matchedCorrespondences,
    unmatched: crossref.unmatchedCorrespondences,
    unexpected: crossref.unexpectedElements,
  };
  const rows = lists[tab] ?? [];

  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <MatchScoreDial score={crossref.matchScore} />
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
            Open777 X-Ray
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 21, color: tone.color, margin: '6px 0 10px' }}>
            {tone.label}
          </div>
          {crossref.summary ? (
            <div style={{ fontFamily: 'var(--serif2)', fontSize: 15.5, lineHeight: 1.65, color: 'var(--muted)' }}>
              {crossref.summary}
            </div>
          ) : null}
        </div>
      </div>

      {crossref.ritualValidation?.actualRitualForm ? (
        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: 'var(--card2)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip tone={crossref.ritualValidation.isCorrect ? '#34c08a' : '#b9a44a'}>
              {crossref.ritualValidation.isCorrect ? 'ritual form valid' : 'ritual form diverges'}
            </Chip>
            {crossref.ritualValidation.pathCategory ? (
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>{crossref.ritualValidation.pathCategory}</span>
            ) : null}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 9, lineHeight: 1.6 }}>
            <div>
              <span style={{ color: 'var(--faint)' }}>expected — </span>
              {crossref.ritualValidation.expectedRitualForm}
            </div>
            <div style={{ marginTop: 3 }}>
              <span style={{ color: 'var(--faint)' }}>performed — </span>
              {crossref.ritualValidation.actualRitualForm}
            </div>
          </div>
          {crossref.ritualValidation.notes ? (
            <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 8, lineHeight: 1.55 }}>
              {crossref.ritualValidation.notes}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 7, marginTop: 20, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label} · {lists[t.key]?.length ?? 0}
          </Chip>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {rows.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--faint)', padding: '18px 0' }}>
            Nothing in this category.
          </div>
        ) : (
          rows.map((o) => <ObservationRow key={o.id} o={o} onRow={onRow} />)
        )}
      </div>
      {tab === 'unmatched' && rows.length > 0 ? (
        <SectionLabel style={{ marginTop: 14, color: 'var(--faint)' }}>
          These are absences, not failures — a working need not touch every correspondence.
        </SectionLabel>
      ) : null}
    </Card>
  );
}
