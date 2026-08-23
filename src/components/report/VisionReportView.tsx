import { useEffect, useMemo, useRef, useState } from 'react';
import type { RecordingDetail, ReportStatusResponse, VisionReport } from '../../lib/apiTypes';
import { api } from '../../lib/api';
import { formatClock, normalizeReport, scoreTone } from '../../lib/report/normalize';
import { exportFilename, reportToJson, reportToMarkdown } from '../../lib/report/reportMarkdown';
import { Button, Card, Chip, EmptyState, SectionLabel } from '../ui';
import XRayPanel from './XRayPanel';
import SceneSection from './SceneSection';
import { ArchetypesPanel, MoodboardPanel } from './SynthesisPanels';
import LegacyAnalysisBody from './LegacyAnalysisBody';

type Tab = 'reading' | 'xray' | 'archetypes' | 'moodboard' | 'transcript';

/**
 * The full vision report.
 *
 * Degradation is designed in, not bolted on: most recordings in a user's
 * history predate the report pipeline, and one being processed right now has
 * no report at all. Every state renders something intentional.
 */
export default function VisionReportView({
  detail,
  onMotif,
  onCorrespondence,
}: {
  detail: RecordingDetail;
  onMotif?: (motif: string) => void;
  onCorrespondence?: (row: string) => void;
}) {
  const [report, setReport] = useState<VisionReport | null>(null);
  const [status, setStatus] = useState<ReportStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('reading');
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const recordingId = detail.recording?.id;
  const recordingStatus = detail.recording?.status;

  // Fetch the report once, only when the API says one exists. Never poll this
  // endpoint — it is ~60-130 KB; /report/status is 500 bytes.
  useEffect(() => {
    let cancelled = false;
    setReport(null);
    setError(null);
    if (!recordingId || !detail.reportAvailable) return;
    setLoading(true);
    api
      .getReport(recordingId)
      .then((r) => {
        if (!cancelled) setReport(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the report');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recordingId, detail.reportAvailable]);

  // Poll the cheap status endpoint only while work is in flight.
  useEffect(() => {
    if (!recordingId) return;
    const inFlight =
      recordingStatus === 'uploaded' || recordingStatus === 'transcribing' || recordingStatus === 'analyzing';
    if (!inFlight) return;

    let cancelled = false;
    let delay = 5000;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const s = await api.getReportStatus(recordingId);
        if (cancelled) return;
        setStatus(s);
        if (s.recordingStatus === 'complete' || s.recordingStatus === 'failed') return;
      } catch {
        // Transient — keep backing off rather than hammering.
      }
      // Back off: a 35-minute recording takes minutes, and a fixed 5 s poll
      // both wastes requests and used to hit a hard 10-minute ceiling.
      delay = Math.min(delay * 1.4, 30000);
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [recordingId, recordingStatus]);

  const normalized = useMemo(() => normalizeReport(detail, report), [detail, report]);

  const seek = (ms: number, sceneNumber: number) => {
    setActiveScene(sceneNumber);
    const el = audioRef.current;
    if (el && Number.isFinite(ms)) {
      el.currentTime = ms / 1000;
      void el.play().catch(() => undefined);
    }
  };

  // Keep the active scene in step with playback.
  const onTimeUpdate = () => {
    const el = audioRef.current;
    if (!el || normalized.scenes.length === 0) return;
    const ms = el.currentTime * 1000;
    const current = normalized.scenes.find(
      (s) => s.startMs !== null && s.endMs !== null && ms >= s.startMs && ms < s.endMs,
    );
    if (current && current.sceneNumber !== activeScene) setActiveScene(current.sceneNumber);
  };

  const audio = detail.audioUrl ? (
    <audio
      ref={audioRef}
      controls
      src={detail.audioUrl}
      onTimeUpdate={onTimeUpdate}
      style={{ width: '100%', marginTop: 12 }}
    />
  ) : null;

  // ── Pending / failed ──
  if (normalized.kind === 'pending') {
    return (
      <div>
        <StageLadder status={status} reason={normalized.reason} />
        {detail.transcription?.rawText ? (
          <>
            <SectionLabel>Transcript so far</SectionLabel>
            <TranscriptBody detail={detail} />
          </>
        ) : null}
      </div>
    );
  }

  if (normalized.kind === 'failed') {
    return (
      <Card style={{ boxShadow: 'inset 0 0 0 1px var(--danger)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--danger)' }}>
          This reading could not be completed
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
          {status?.errorMessage ?? 'The pipeline failed while processing this recording.'}
        </div>
        {audio}
      </Card>
    );
  }

  if (normalized.kind === 'empty') {
    return <EmptyState glyph="◉" title="Nothing here yet" subtitle="This recording has no reading." />;
  }

  // ── Legacy thin analysis ──
  if (normalized.kind === 'legacy') {
    return (
      <div>
        <div style={{ fontSize: 12, color: 'var(--faint)', marginBottom: 10 }}>{normalized.reason}</div>
        {audio}
        <LegacyAnalysisBody detail={detail} />
      </div>
    );
  }

  // ── Rich report ──
  const meta = report?.meta;
  const tone = scoreTone(normalized.matchScore);
  const tabs: Array<{ key: Tab; label: string; show: boolean }> = [
    { key: 'reading', label: 'Reading', show: normalized.sections.scenes },
    { key: 'xray', label: 'Open777 X-Ray', show: normalized.sections.crossref },
    { key: 'archetypes', label: 'Archetypes', show: normalized.sections.archetypes },
    { key: 'moodboard', label: 'Mood board', show: normalized.sections.moodboard },
    { key: 'transcript', label: 'Transcript', show: Boolean(detail.transcription) },
  ];
  const visible = tabs.filter((t) => t.show);
  const activeTab = visible.some((t) => t.key === tab) ? tab : visible[0]?.key ?? 'reading';

  /**
   * Save the reading to disk. Markdown for reading and keeping, JSON for the
   * complete record. Both are produced by the serialiser the phone shares, so
   * a reading exported here and one AirDropped off the phone are the same file.
   */
  const downloadReport = (r: VisionReport, format: 'md' | 'json') => {
    const opts = {
      transcript: detail.transcription?.rawText ?? null,
      pathLabel: [`Path ${r.pathNumber}`, meta?.letter, meta?.tarot].filter(Boolean).join(' · '),
      exportedAt: new Date().toISOString(),
    };
    const body = format === 'md' ? reportToMarkdown(r, opts) : reportToJson(r, opts);
    const url = URL.createObjectURL(
      new Blob([body], { type: format === 'md' ? 'text/markdown' : 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename(r, format, opts);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: 'o7rise .35s ease both' }}>
      {/* Header */}
      <Card style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
              Path {report?.pathNumber ?? detail.recording.pathNumber}
              {meta?.letter ? ` · ${meta.letter}` : ''}
              {meta?.attribution ? ` · ${meta.attribution}` : ''}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--cream)', marginTop: 5 }}>
              {meta?.tarot ?? 'Vision report'}
            </div>
            <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
              {normalized.matchScore !== null ? (
                <Chip tone={tone.color}>Open777 {Math.round(normalized.matchScore)}/100</Chip>
              ) : null}
              <Chip>{normalized.scenes.length} scenes</Chip>
              {meta?.transcribedWords ? <Chip>{meta.transcribedWords} words</Chip> : null}
              {meta?.recordedDurationSec ? (
                <Chip>{Math.round(meta.recordedDurationSec / 60)} min</Chip>
              ) : null}
              {normalized.sections.verified ? (
                <Chip tone="#34c08a">audited</Chip>
              ) : (
                <Chip tone="#7d7790" title="Run the adversarial faithfulness audit">
                  not audited
                </Chip>
              )}
              {report?.status === 'partial' ? <Chip tone="#b9a44a">partial</Chip> : null}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {report ? (
              <>
                <Button variant="ghost" onClick={() => downloadReport(report, 'md')}>
                  Export reading
                </Button>
                <Button variant="ghost" onClick={() => downloadReport(report, 'json')}>
                  Export data
                </Button>
              </>
            ) : null}
            {!normalized.sections.verified && recordingId ? (
              <Button
                variant="ghost"
                onClick={() => {
                  void api.verifyReport(recordingId).catch(() => undefined);
                }}
              >
                Run deep verify
              </Button>
            ) : null}
          </div>
        </div>
        {normalized.reason ? (
          <div style={{ fontSize: 12, color: 'var(--info-text)', marginTop: 10 }}>{normalized.reason}</div>
        ) : null}
        {audio}
      </Card>

      {error ? (
        <div style={{ fontSize: 12.5, color: 'var(--danger)', marginTop: 10 }}>{error}</div>
      ) : null}
      {loading ? (
        <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 10 }}>Loading the reading…</div>
      ) : null}

      {/* Section nav — only the sections that exist */}
      <div style={{ display: 'flex', gap: 7, margin: '18px 0 4px', flexWrap: 'wrap' }}>
        {visible.map((t) => (
          <Chip key={t.key} active={activeTab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      {activeTab === 'reading' ? (
        <SceneSection scenes={normalized.scenes} activeScene={activeScene} onSeek={seek} />
      ) : null}

      {activeTab === 'xray' && report?.crossref ? (
        <XRayPanel crossref={report.crossref} onRow={onCorrespondence} />
      ) : null}

      {activeTab === 'archetypes' && report?.archetypes ? (
        <ArchetypesPanel archetypes={report.archetypes} onMotif={onMotif} />
      ) : null}

      {activeTab === 'moodboard' && report?.moodboard ? (
        <MoodboardPanel moodboard={report.moodboard} />
      ) : null}

      {activeTab === 'transcript' ? <TranscriptBody detail={detail} /> : null}

      {/* Voice readings sit under everything — they interpret the record. */}
      {report?.voiceReadings?.length ? (
        <>
          <SectionLabel>Readings in other voices</SectionLabel>
          <div style={{ display: 'grid', gap: 12 }}>
            {report.voiceReadings.map((v) => (
              <Card key={v.id}>
                <div style={{ fontSize: 11, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
                  {v.voice.replace(/_/g, ' ')}
                </div>
                <div style={{ fontFamily: 'var(--serif2)', fontSize: 15.5, lineHeight: 1.7, color: 'var(--muted)', marginTop: 9, whiteSpace: 'pre-wrap' }}>
                  {v.body}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function TranscriptBody({ detail }: { detail: RecordingDetail }) {
  const t = detail.transcription;
  const text = t?.rawText || t?.text || '';
  if (!text) return <EmptyState glyph="☷" title="No transcript" />;
  return (
    <Card>
      <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
        {t?.language ? <Chip>{t.language}</Chip> : null}
        {t?.wordCount ? <Chip>{t.wordCount} words</Chip> : null}
        {t?.modelUsed ? <Chip>{t.modelUsed}</Chip> : null}
      </div>
      <div style={{ fontFamily: 'var(--serif2)', fontSize: 15.5, lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>
        {text}
      </div>
    </Card>
  );
}

/** Real per-stage progress instead of a spinner. */
function StageLadder({ status, reason }: { status: ReportStatusResponse | null; reason: string | null }) {
  const rungs = [
    { key: 'transcription', label: 'Transcribe' },
    { key: 'analysis', label: 'Read the vision' },
  ];
  const jobByType = new Map((status?.jobs ?? []).map((j) => [j.type, j]));

  return (
    <Card>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--cream)' }}>
        {reason ?? 'Processing'}
      </div>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {rungs.map((r) => {
          const job = jobByType.get(r.key);
          const state = job?.status ?? 'queued';
          const color =
            state === 'complete' ? '#34c08a' : state === 'processing' ? '#9d6bff' : state === 'failed' ? '#e0464b' : '#605b6e';
          return (
            <div key={r.key} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: state === 'processing' ? `0 0 10px ${color}` : undefined,
                  animation: state === 'processing' ? 'o7glow 1.6s ease-in-out infinite' : undefined,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13.5, color: state === 'queued' ? 'var(--faint)' : 'var(--cream)' }}>
                {r.label}
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--dim)' }}>{state}</span>
              {job && job.attempts > 1 ? (
                <Chip tone="#b9a44a">retrying ({job.attempts})</Chip>
              ) : null}
              {job?.completedAt && job.createdAt ? (
                <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                  {formatClock(new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime())}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {status?.stages?.length ? (
        <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 14 }}>
          {status.stages.length} analysis stages recorded
        </div>
      ) : null}
      <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 14, lineHeight: 1.55 }}>
        A full reading runs the vision through segmentation, per-scene interpretation, the Open777
        cross-reference and synthesis. It takes several minutes for a long working.
      </div>
    </Card>
  );
}
