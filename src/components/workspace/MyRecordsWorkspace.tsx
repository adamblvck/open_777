import { useEffect, useState } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { useAuth } from '../../hooks/useAuth';
import { api, type RecordingDetail } from '../../lib/api';
import AnalysisView from '../common/AnalysisView';

function Empty({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 44, color: 'var(--purpledim)', filter: 'drop-shadow(0 0 18px var(--purple))', animation: 'o7glow 6s ease-in-out infinite' }}>⊚</div>
      <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, color: 'var(--muted)', marginTop: 18 }}>{title}</div>
      <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, color: 'var(--faint)', marginTop: 8, maxWidth: 340, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

export default function MyRecordsWorkspace() {
  const id = useOpen777((s) => s.selectedRecordingId);
  const setSelected = useOpen777((s) => s.setSelectedRecording);
  const flash = useOpen777((s) => s.flash);
  const { isSignedIn } = useAuth();
  const [detail, setDetail] = useState<RecordingDetail | null>(null);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    let alive = true;
    let timer: number | undefined;
    const load = async () => {
      try {
        const d = await api.getRecording(id);
        if (!alive) return;
        setDetail(d);
        const st = d.recording?.status;
        if (st !== 'complete' && st !== 'failed') timer = window.setTimeout(load, 5000);
      } catch {
        /* network blip */
      }
    };
    load();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (!isSignedIn) return <Empty title="Your records" sub="Sign in (bottom-left) to view recordings you have uploaded to the cloud." />;
  if (!id) return <Empty title="Your records" sub="Select a recording on the left to play it back and read its analysis." />;
  if (!detail) return <Empty title="Loading…" sub="Fetching the recording and its readings." />;

  const rec = detail.recording;
  const inFlight = rec.status !== 'complete' && rec.status !== 'failed';
  const del = async () => {
    if (!window.confirm('Delete this recording and its analysis? This cannot be undone.')) return;
    try {
      await api.deleteRecording(id);
      flash('Recording deleted.');
      setSelected('');
    } catch {
      flash('Delete failed — is the backend online?');
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '34px 52px 60px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)' }}>Recorded scrying</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 32, color: 'var(--cream)' }}>Path {rec.pathNumber}</div>
            <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{new Date(rec.recordedAt).toLocaleString()} · status: {rec.status}{inFlight ? ' (polling…)' : ''}</div>
          </div>
          <span onClick={del} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--danger)', cursor: 'pointer' }}>Delete</span>
        </div>

        {detail.audioUrl ? (
          <audio controls src={detail.audioUrl} style={{ width: '100%', marginBottom: 18 }} />
        ) : (
          <div style={{ fontSize: 13, color: 'var(--faint)', marginBottom: 18 }}>Audio link unavailable.</div>
        )}

        <AnalysisView detail={detail} />
      </div>
    </div>
  );
}
