import { useState } from 'react';
import type { RecordingDetail } from '../../lib/api';

const label: React.CSSProperties = { fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--faint)', margin: '18px 0 10px' };

export default function AnalysisView({ detail }: { detail: RecordingDetail }) {
  const analyses = detail.analyses || [];
  const [voiceIdx, setVoiceIdx] = useState(0);
  const a = analyses[voiceIdx];
  const t = detail.transcription;
  const transcript = t?.rawText || t?.text || '';

  return (
    <div style={{ animation: 'o7rise .35s ease both' }}>
      {analyses.length > 1 ? (
        <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap' }}>
          {analyses.map((an, i) => (
            <span key={an.id || i} onClick={() => setVoiceIdx(i)} style={{ fontSize: 12, padding: '6px 13px', borderRadius: 999, cursor: 'pointer', background: i === voiceIdx ? 'var(--purple)' : 'transparent', color: i === voiceIdx ? '#0a0810' : 'var(--muted)', boxShadow: i === voiceIdx ? 'none' : 'inset 0 0 0 1px var(--line2)' }}>
              {(an.voice || 'reading').replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      ) : null}

      {a?.summary ? (
        <>
          <div style={label}>The reading</div>
          <div style={{ fontFamily: 'var(--serif2)', fontSize: 17, color: 'var(--cream)', lineHeight: 1.62, padding: '18px 20px', borderRadius: 16, background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--line2)' }}>{a.summary}</div>
        </>
      ) : null}

      {a?.scenes?.length ? (
        <>
          <div style={label}>Scenes</div>
          {a.scenes.map((s) => (
            <div key={s.index} style={{ marginBottom: 10, padding: '14px 16px', borderRadius: 14, background: 'var(--card2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17, color: 'var(--cream)' }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--muted)', lineHeight: 1.5, marginTop: 4 }}>{s.description}</div>
            </div>
          ))}
        </>
      ) : null}

      {a?.entities?.length ? (
        <>
          <div style={label}>Entities encountered</div>
          {a.entities.map((e, i) => (
            <div key={i} style={{ marginBottom: 10, padding: '14px 16px', borderRadius: 14, background: 'var(--card2)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17, color: 'var(--cream)' }}>{e.name}</span>
                {e.kind ? <span style={{ fontSize: 11, color: 'var(--purpledim)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{e.kind}</span> : null}
              </div>
              {e.description ? <div style={{ fontFamily: 'var(--serif2)', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginTop: 4 }}>{e.description}</div> : null}
              {e.dialogues?.map((d, di) => (
                <div key={di} style={{ marginTop: 6, paddingLeft: 12, borderLeft: `2px solid ${d.speaker === 'entity' ? 'var(--purple)' : 'var(--line2)'}`, fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 14, color: d.speaker === 'entity' ? 'var(--purple2)' : 'var(--dim)' }}>
                  {d.speaker === 'entity' ? '' : 'you: '}{d.text}
                </div>
              ))}
            </div>
          ))}
        </>
      ) : null}

      {a?.ritualActions?.length ? (
        <>
          <div style={label}>Ritual actions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {a.ritualActions.map((r, i) => (
              <span key={i} style={{ fontSize: 13, padding: '8px 14px', borderRadius: 999, background: '#0a0810', boxShadow: 'inset 0 0 0 1px var(--line2)', color: 'var(--cream)' }}>
                {[r.form, r.category, r.detail].filter(Boolean).join(' · ') || 'action'}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {transcript ? (
        <>
          <div style={label}>Transcription{t?.language ? ` · ${t.language}` : ''}</div>
          <div style={{ fontFamily: 'var(--serif2)', fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{transcript}</div>
        </>
      ) : null}

      {!a && !transcript ? <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', color: 'var(--faint)', padding: '20px 0' }}>No analysis yet — the pipeline may still be running, or the AI providers are in mock mode.</div> : null}
    </div>
  );
}
