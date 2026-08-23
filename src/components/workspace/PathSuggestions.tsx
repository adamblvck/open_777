import { useEffect, useState } from 'react';
import { api, type PathSuggestion } from '../../lib/api';
import { pathLabel } from '../../lib/pathMapping';

const CONFIDENCE_COLOR: Record<PathSuggestion['confidence'], string> = {
  high: '#4ade80',
  medium: '#f0b232',
  low: 'var(--faint)',
};

const KIND_COPY: Record<string, string> = {
  letter: 'named the letter',
  trump: 'named the trump',
  explicit_number: 'said the path number',
  letter_meaning: "the letter's meaning",
  intelligence: 'the Yetziratic intelligence',
  attribution: 'the attribution',
};

/**
 * Shown on recordings filed under General — the case where someone dropped in
 * a voice memo called "New Recording 104" and never told us what it was.
 *
 * The evidence is the point: a bare "we think Path 22" is a guess the user has
 * no reason to trust, whereas the sentence where they said "the Hebrew letter
 * Lamed" is something they can check in one glance.
 */
export default function PathSuggestions({
  recordingId,
  currentPath,
  onFiled,
}: {
  recordingId: string;
  currentPath: number;
  onFiled: (pathNumber: number) => void;
}) {
  const [suggestions, setSuggestions] = useState<PathSuggestion[] | null>(null);
  const [ready, setReady] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .pathSuggestions(recordingId)
      .then((r) => {
        if (!alive) return;
        setReady(r.ready);
        setSuggestions(r.suggestions);
        // Open the evidence for the top pick when it is clearly ahead.
        if (r.suggestions[0]?.confidence === 'high') setExpanded(r.suggestions[0].pathNumber);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Could not load suggestions'));
    return () => {
      alive = false;
    };
  }, [recordingId]);

  const file = async (pathNumber: number) => {
    setBusy(pathNumber);
    setError('');
    try {
      await api.repathRecording(recordingId, pathNumber);
      onFiled(pathNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not re-file');
    } finally {
      setBusy(null);
    }
  };

  if (error) return <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>{error}</div>;
  if (!suggestions) return null;

  return (
    <div
      style={{
        borderRadius: 16,
        background: 'var(--card)',
        boxShadow: 'inset 0 0 0 1px rgba(240,178,50,.28)',
        padding: '18px 20px',
        marginBottom: 20,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: '#f0b232' }}>
        Filed under {pathLabel(currentPath)} — where does this belong?
      </div>

      {!ready ? (
        <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 10 }}>
          Waiting for the transcript. Suggestions appear once transcription finishes.
        </div>
      ) : !suggestions.length ? (
        <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 10, lineHeight: 1.55 }}>
          The transcript names no letter, trump or sign we recognise, so we won't guess. Set the path
          by hand above if you know it.
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--dim)', marginTop: 6, lineHeight: 1.5 }}>
            Read from what you actually said in the first minutes of the working.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
            {suggestions.map((s) => {
              const open = expanded === s.pathNumber;
              return (
                <div
                  key={s.pathNumber}
                  style={{
                    borderRadius: 12,
                    background: 'var(--card2)',
                    boxShadow: `inset 0 0 0 1px ${open ? 'var(--line2)' : 'var(--line)'}`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                    <div
                      onClick={() => setExpanded(open ? null : s.pathNumber)}
                      style={{ flex: 1, cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: 14.5, color: 'var(--cream)', fontWeight: 500 }}>
                        {pathLabel(s.pathNumber)} · {s.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: CONFIDENCE_COLOR[s.confidence], marginTop: 3 }}>
                        {s.confidence} confidence · {s.evidence.length} signal
                        {s.evidence.length === 1 ? '' : 's'} · {open ? 'hide' : 'show'} evidence
                      </div>
                    </div>
                    <span
                      onClick={busy === null ? () => file(s.pathNumber) : undefined}
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: '8px 15px',
                        borderRadius: 999,
                        flex: 'none',
                        cursor: busy === null ? 'pointer' : 'not-allowed',
                        background: s.confidence === 'high' ? 'var(--purple)' : 'var(--card)',
                        color: s.confidence === 'high' ? 'var(--navbg)' : 'var(--muted)',
                        boxShadow: s.confidence === 'high' ? 'none' : 'inset 0 0 0 1px var(--line2)',
                      }}
                    >
                      {busy === s.pathNumber ? 'Filing…' : 'File here'}
                    </span>
                  </div>

                  {open ? (
                    <div style={{ padding: '0 14px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {s.evidence.map((e, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--purple2)' }}>{KIND_COPY[e.kind] ?? e.kind}</span>
                          {' — '}
                          <span style={{ color: 'var(--cream)' }}>{e.term}</span>
                          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', color: 'var(--faint)', marginTop: 2 }}>
                            “{e.quote}”
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
