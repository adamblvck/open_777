import { useOpen777 } from '../../state/useOpen777';
import { useRecordingsApi } from '../../hooks/useRecordingsApi';
import { pathLabel } from '../../lib/pathMapping';
import type { RecordingRow } from '../../lib/api';

const STATUS_COLOR: Record<string, string> = {
  uploaded: '#fcbd3f', transcribing: '#fcbd3f', analyzing: '#fcbd3f', complete: '#34c08a', failed: '#e0464b',
};

function fmtDur(ms: number) {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function MyRecordsBrowse() {
  const selected = useOpen777((s) => s.selectedRecordingId);
  const setSelected = useOpen777((s) => s.setSelectedRecording);
  const { recordings, loading, error, isSignedIn } = useRecordingsApi();

  if (!isSignedIn) {
    return <div style={{ padding: '24px 24px', fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 14, color: 'var(--dim)', lineHeight: 1.5 }}>Sign in (bottom-left) to keep a cloud library of your recorded scryings and their readings.</div>;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 26px' }}>
      {loading ? <div style={{ padding: 16, color: 'var(--faint)', fontSize: 13 }}>Loading…</div> : null}
      {error ? <div style={{ padding: 16, color: 'var(--danger)', fontSize: 13 }}>{error}</div> : null}
      {!loading && !recordings.length && !error ? <div style={{ padding: '16px 8px', fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 14, color: 'var(--faint)' }}>No recordings yet. Record a scrying in the chamber and upload it.</div> : null}
      {recordings.map((r: RecordingRow) => {
        const active = r.id === selected;
        const sc = STATUS_COLOR[r.status] || 'var(--faint)';
        return (
          <div key={r.id} onClick={() => setSelected(r.id)} style={{ padding: '12px 13px', borderRadius: 13, cursor: 'pointer', marginBottom: 4, background: active ? 'rgba(157,107,255,.1)' : 'transparent', boxShadow: active ? 'inset 0 0 0 1px rgba(157,107,255,.3)' : 'inset 0 0 0 1px var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 16, color: 'var(--cream)' }}>{pathLabel(r.pathNumber)}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: sc, textTransform: 'uppercase', letterSpacing: '.08em' }}>{r.status}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>{new Date(r.recordedAt).toLocaleString()} · {fmtDur(r.durationMs)}</div>
          </div>
        );
      })}
    </div>
  );
}
