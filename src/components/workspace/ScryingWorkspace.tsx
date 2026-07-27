import { useState } from 'react';
import { useOpen777 } from '../../state/useOpen777';
import { useAuth } from '../../hooks/useAuth';
import { useBackendHealth } from '../../hooks/useBackendHealth';
import { useWebAudioRecorder, recorderSupported, type RecordResult } from '../../hooks/useWebAudioRecorder';
import { uploadRecording, pollUntilComplete } from '../../lib/uploadPipeline';
import { api, ApiError, type RecordingDetail } from '../../lib/api';
import { useEntitlement } from '../../hooks/useEntitlement';
import AnalysisView from '../common/AnalysisView';
import { ritualContent, RITUAL_PREP } from '../../lib/ritualContent';

const WAVE = Array.from({ length: 28 }, (_, i) => Math.round(18 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 22));
const fmt = (ms: number) => `${Math.floor(ms / 1000)}s`;

export default function ScryingWorkspace() {
  const scryText = useOpen777((s) => s.scryText);
  const analysis = useOpen777((s) => s.analysis);
  const setScryText = useOpen777((s) => s.setScryText);
  const transcribe = useOpen777((s) => s.transcribe);
  const analyze = useOpen777((s) => s.analyze);
  const copySummary = useOpen777((s) => s.copySummary);
  const exportReading = useOpen777((s) => s.exportReading);
  const saveSession = useOpen777((s) => s.saveSession);
  const jumpToReference = useOpen777((s) => s.jumpToReference);
  const flash = useOpen777((s) => s.flash);

  const { isSignedIn } = useAuth();
  const ent = useEntitlement();
  const health = useBackendHealth();
  const rec = useWebAudioRecorder();

  const [pathNumber, setPathNumber] = useState(0);
  const [captured, setCaptured] = useState<RecordResult | null>(null);
  const [cloudStatus, setCloudStatus] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [cloudDetail, setCloudDetail] = useState<RecordingDetail | null>(null);
  const [prepOpen, setPrepOpen] = useState(false);
  const [expandedPrep, setExpandedPrep] = useState<string | null>(null);

  const wordCount = (scryText.trim() ? scryText.trim().split(/\s+/).length : 0) + ' words';
  const canAnalyze = scryText.trim().length > 0;
  const cloudReady = isSignedIn && health.online && health.db;

  const toggleRecord = async () => {
    if (rec.isRecording) {
      const result = await rec.stop();
      if (result) setCaptured(result);
    } else {
      setCaptured(null);
      setCloudDetail(null);
      try {
        await rec.start();
      } catch {
        flash('Microphone permission denied or unavailable.');
      }
    }
  };

  // Free tier may process only the free path (Tau/32); anything else needs a sub.
  const needsSub = ent.needsSubscription(pathNumber);

  const upload = async () => {
    if (!captured) return;
    // Paywall: route un-entitled users to Stripe Checkout instead of uploading.
    if (needsSub) {
      flash(`Processing Path ${pathNumber} needs a subscription. Redirecting to checkout…`);
      try {
        await ent.subscribe();
      } catch {
        flash('Could not start checkout. Please try again.');
      }
      return;
    }
    setUploading(true);
    setCloudStatus('uploading');
    try {
      const { recordingId } = await uploadRecording(captured, pathNumber);
      setCloudStatus('transcribing');
      await pollUntilComplete(recordingId, { onStatus: (s) => setCloudStatus(s) });
      const detail = await api.getRecording(recordingId);
      setCloudDetail(detail);
      setCloudStatus(detail.recording?.status || 'complete');
      flash('Cloud reading ready.');
    } catch (e) {
      setCloudStatus('failed');
      // API enforces the gate too — surface a 402 as a subscribe prompt.
      if (e instanceof ApiError && e.status === 402) {
        flash('A subscription is required to process this path.');
        ent.subscribe().catch(() => {});
      } else {
        flash('Upload failed: ' + (e instanceof Error ? e.message : 'error'));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* left: capture */}
      <div style={{ overflowY: 'auto', padding: '42px 40px 44px', borderRight: '1px solid var(--line)' }}>
        <div style={{ fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 11, color: 'var(--purpledim)', marginBottom: 8 }}>Scrying chamber · capture</div>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 34, color: 'var(--cream)', marginBottom: 18 }}>What did you see?</div>

        {/* ritual preparation */}
        <div style={{ marginBottom: 18 }}>
          <div onClick={() => setPrepOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '13px 16px', borderRadius: 14, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>Ritual preparation</div>
              <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>Prepare the temple before you scry — banish, invoke, rise, and enter the gate.</div>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 15 }}>{prepOpen ? '▾' : '▸'}</span>
          </div>
          {prepOpen ? (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {RITUAL_PREP.map((key, i) => {
                const e = ritualContent[key];
                const open = expandedPrep === key;
                return (
                  <div key={key} style={{ borderRadius: 11, background: 'var(--card2)', boxShadow: 'inset 0 0 0 1px var(--line)', overflow: 'hidden' }}>
                    <div onClick={() => setExpandedPrep(open ? null : key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', cursor: 'pointer' }}>
                      <span style={{ fontSize: 11, color: 'var(--faint)', width: 18, flex: 'none' }}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 15, color: 'var(--cream)', flex: 1 }}>{e.title}</span>
                      <span style={{ color: 'var(--purple2)', fontSize: 14 }}>{open ? '−' : '+'}</span>
                    </div>
                    {open ? <div style={{ padding: '0 16px 14px 42px', fontFamily: 'var(--serif2)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>{e.body}</div> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* recorder */}
        <div style={{ borderRadius: 18, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)', padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div onClick={recorderSupported() ? toggleRecord : undefined} style={{ width: 54, height: 54, flex: 'none', borderRadius: '50%', background: rec.isRecording ? '#e0464b' : 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: recorderSupported() ? 'pointer' : 'not-allowed', animation: rec.isRecording ? 'o7recpulse 1.4s ease-in-out infinite' : 'none' }}>
              <span style={{ width: rec.isRecording ? 16 : 18, height: rec.isRecording ? 16 : 18, background: '#fff', borderRadius: rec.isRecording ? 4 : '50%', display: 'block' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--cream)', fontWeight: 500 }}>{rec.isRecording ? `Recording… ${fmt(rec.durationMs)}` : captured ? `Recorded · ${fmt(captured.durationMs)}` : 'Record a scrying'}</div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{recorderSupported() ? (rec.isRecording ? 'Tap to stop and capture' : 'Your browser microphone') : 'Recording not supported in this browser'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
              {WAVE.map((h, i) => (
                <span key={i} style={{ width: 3, height: h, background: rec.isRecording ? '#e0464b' : 'var(--line2)', borderRadius: 2, transformOrigin: 'bottom', animation: rec.isRecording ? `o7wave ${(0.6 + (i % 5) * 0.12).toFixed(2)}s ease-in-out infinite ${(i * 0.04).toFixed(2)}s` : 'none' }} />
              ))}
            </div>
          </div>

          {/* path selector + upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--dim)' }}>Path</span>
            <select value={pathNumber} onChange={(e) => setPathNumber(Number(e.target.value))} style={{ background: 'var(--panel)', color: 'var(--cream)', border: 'none', boxShadow: 'inset 0 0 0 1px var(--line2)', borderRadius: 10, padding: '7px 10px', fontSize: 13 }}>
              {Array.from({ length: 35 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n === 0 ? 'General (0)' : n}</option>
              ))}
            </select>
            <div style={{ flex: 1 }} />
            {captured ? (
              <span onClick={cloudReady && !uploading ? upload : undefined} title={cloudReady ? '' : isSignedIn ? 'Backend database offline' : 'Sign in to upload'} style={{ fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 999, cursor: cloudReady && !uploading ? 'pointer' : 'not-allowed', background: cloudReady ? 'var(--purple)' : 'var(--card2)', color: cloudReady ? '#0a0810' : 'var(--faint)', boxShadow: cloudReady ? '0 0 20px rgba(157,107,255,.4)' : 'inset 0 0 0 1px var(--line2)' }}>
                {uploading ? cloudStatus || 'uploading…' : 'Upload & analyse ✷'}
              </span>
            ) : null}
          </div>
          {captured && !cloudReady ? (
            <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 8 }}>{!isSignedIn ? 'Sign in (bottom-left) to upload this recording for cloud transcription & analysis. You can still analyse text locally below.' : 'The backend database is offline — cloud upload is unavailable. Local text analysis still works.'}</div>
          ) : null}
        </div>

        <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--faint)', margin: '4px 0 10px' }}>Or work from text</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <span onClick={transcribe} style={{ flex: 1, textAlign: 'center', fontSize: 12.5, padding: 10, borderRadius: 11, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}>⌁ Insert a sample transcript</span>
        </div>
        <textarea value={scryText} onChange={(e) => setScryText(e.target.value)} placeholder="Paste your transcript, or write the vision as it returns to you…" style={{ width: '100%', minHeight: 220, resize: 'vertical', background: 'var(--panel)', border: 'none', outline: 'none', boxShadow: 'inset 0 0 0 1px var(--line2)', borderRadius: 16, padding: 20, color: 'var(--cream)', fontFamily: 'var(--serif2)', fontSize: 16.5, lineHeight: 1.65 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--faint)' }}>{wordCount}</span>
          <span onClick={analyze} style={{ fontSize: 14, padding: '13px 30px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', background: canAnalyze ? 'var(--purple)' : 'var(--card2)', color: canAnalyze ? '#0a0810' : 'var(--faint)', boxShadow: canAnalyze ? '0 0 24px rgba(157,107,255,.4)' : 'inset 0 0 0 1px var(--line2)' }}>Run local analysis ✷</span>
        </div>
      </div>

      {/* right: reading */}
      <div style={{ overflowY: 'auto', padding: '42px 40px 44px', background: 'var(--panel2)' }}>
        {cloudDetail ? (
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--purpledim)', marginBottom: 12 }}>The cloud reading</div>
            <AnalysisView detail={cloudDetail} />
          </div>
        ) : analysis ? (
          <div style={{ animation: 'o7rise .35s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>The reading · local</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span onClick={copySummary} style={{ fontSize: 11.5, padding: '7px 14px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}>⧉ Copy</span>
                <span onClick={exportReading} style={{ fontSize: 11.5, padding: '7px 14px', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--muted)', cursor: 'pointer' }}>↧ .md</span>
                <span onClick={saveSession} style={{ fontSize: 11.5, padding: '7px 14px', borderRadius: 999, background: 'var(--purple)', color: '#0a0810', fontWeight: 600, cursor: 'pointer' }}>Save</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
              <div style={{ flex: 1, padding: '18px 20px', borderRadius: 16, background: 'var(--card)', boxShadow: `inset 0 0 0 1px ${analysis.elemColor}55` }}>
                <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--faint)' }}>Dominant element</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}><span style={{ fontSize: 24, color: analysis.elemColor }}>{analysis.elemGlyph}</span><span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 24, color: 'var(--cream)' }}>{analysis.elem}</span></div>
              </div>
              <div style={{ flex: 1, padding: '18px 20px', borderRadius: 16, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>
                <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--faint)' }}>Suggested sphere</div>
                <div onClick={() => jumpToReference(analysis.sphereId)} style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 24, color: 'var(--purple)', marginTop: 8, cursor: 'pointer' }}>{analysis.sphere} →</div>
              </div>
            </div>
            <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 11 }}>Correspondences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {analysis.terms.map((t) => (
                <span key={t.id} onClick={() => jumpToReference(t.id)} style={{ fontSize: 13, padding: '8px 15px', borderRadius: 999, background: '#0a0810', boxShadow: `inset 0 0 0 1px ${t.color}66`, color: 'var(--cream)', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ color: t.color }}>{t.glyph}</span>{t.label}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 11 }}>Integration</div>
            <div style={{ fontFamily: 'var(--serif2)', fontSize: 17, color: 'var(--cream)', lineHeight: 1.62, padding: '20px 22px', borderRadius: 16, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>{analysis.summary}</div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 46, color: 'var(--purpledim)', filter: 'drop-shadow(0 0 18px var(--purple))', animation: 'o7glow 6s ease-in-out infinite' }}>✷</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 24, color: 'var(--muted)', marginTop: 18 }}>The reading appears here</div>
            <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, color: 'var(--faint)', marginTop: 8, maxWidth: 320, lineHeight: 1.5 }}>Record &amp; upload for a cloud reading (scenes, entities, ritual actions), or analyse text locally.</div>
          </div>
        )}
      </div>
    </div>
  );
}
