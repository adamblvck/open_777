import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { uploadRecording } from '../lib/uploadPipeline';
import { fileToRecordResult, inferPathFromFilename, isAudioFile, type PathGuess } from '../lib/audioFile';

export type QueueStage =
  | 'pending'      // in the tray, not started
  | 'reading'      // decoding duration
  | 'uploading'    // PUT to S3
  | 'queued'       // finalized, waiting for a worker
  | 'transcribing'
  | 'analyzing'
  | 'complete'
  | 'failed'
  | 'blocked';     // needs a path before it can start

export interface QueueItem {
  id: string;
  file: File;
  filename: string;
  sizeBytes: number;
  durationMs: number | null;
  pathNumber: number | null;
  guess: PathGuess;
  /** True once the user has overridden the inferred path by hand. */
  pathTouchedByUser: boolean;
  stage: QueueStage;
  progress: number; // 0..1 for the S3 PUT
  recordingId?: string;
  error?: string;
  /** Wall-clock marks, ms since epoch. */
  startedAt?: number;
  uploadedAt?: number;
  finishedAt?: number;
}

const STAGE_FROM_STATUS: Record<string, QueueStage> = {
  uploaded: 'queued',
  transcribing: 'transcribing',
  analyzing: 'analyzing',
  complete: 'complete',
  failed: 'failed',
};

const TERMINAL = new Set<QueueStage>(['complete', 'failed']);

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(0)} MB`;

/**
 * Turn a failure into something a person can act on. The raw messages are
 * accurate but unhelpful in a queue row — "File exceeds 62914560 bytes" tells
 * you nothing about what to do with a 90-minute recording.
 */
function explain(err: unknown, item: QueueItem): string {
  if (err instanceof ApiError) {
    if (err.status === 402) return 'Needs a transcript credit or a subscription for this path.';
    if (err.status === 413) return `Too large at ${mb(item.sizeBytes)} — split the recording and upload the halves.`;
    if (err.status === 401) return 'Signed out — sign in again and retry.';
  }
  if (err instanceof Error) {
    // The classic symptom of a bucket with no CORS rule: an opaque failure with
    // no status, no body, and nothing in the console. Name it rather than
    // making the next person rediscover it.
    if (/network error/i.test(err.message)) {
      return 'Could not reach storage. If every file fails this way, the bucket is missing its CORS rule — run `npm run storage:ensure`.';
    }
    return err.message;
  }
  return 'Upload failed.';
}

/**
 * Batch upload tray.
 *
 * Uploads run one at a time on purpose: the API's transcription and analysis
 * workers both use batchSize 1, so racing the PUTs only buys a deeper queue,
 * and a serial pump keeps per-file timings attributable. Status for every
 * in-flight item comes from ONE /recordings list poll rather than N detail
 * polls — the detail payload carries the whole transcript.
 */
export function useUploadQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const itemsRef = useRef<QueueItem[]>([]);
  itemsRef.current = items;

  const patch = useCallback((id: string, next: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...next } : it)));
  }, []);

  /** Add files to the tray, inferring a path for each from its filename. */
  const addFiles = useCallback((files: FileList | File[]) => {
    const accepted: QueueItem[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      if (!isAudioFile(file)) {
        rejected.push(file.name);
        continue;
      }
      const guess = inferPathFromFilename(file.name);
      accepted.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        filename: file.name,
        sizeBytes: file.size,
        durationMs: null,
        pathNumber: guess.pathNumber,
        guess,
        pathTouchedByUser: false,
        stage: guess.pathNumber === null ? 'blocked' : 'pending',
        progress: 0,
      });
    }
    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...accepted.filter((a) => !seen.has(a.id))];
    });
    return { added: accepted.length, rejected };
  }, []);

  const setPath = useCallback((id: string, pathNumber: number | null) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              pathNumber,
              pathTouchedByUser: true,
              stage: it.stage === 'blocked' && pathNumber !== null ? 'pending' : it.stage,
            }
          : it
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearFinished = useCallback(() => {
    setItems((prev) => prev.filter((it) => !TERMINAL.has(it.stage)));
  }, []);

  /** Serial pump: read → presign → PUT → finalize, one file at a time. */
  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    try {
      for (;;) {
        const next = itemsRef.current.find((it) => it.stage === 'pending' && it.pathNumber !== null);
        if (!next) break;

        const startedAt = Date.now();
        patch(next.id, { stage: 'reading', startedAt, error: undefined });
        try {
          const rec = await fileToRecordResult(next.file);
          patch(next.id, { durationMs: rec.durationMs, stage: 'uploading', progress: 0 });

          const { recordingId } = await uploadRecording(rec, next.pathNumber!, {
            onProgress: (fraction) => patch(next.id, { progress: fraction }),
          });

          patch(next.id, {
            stage: 'queued',
            progress: 1,
            recordingId,
            uploadedAt: Date.now(),
          });
        } catch (err) {
          patch(next.id, { stage: 'failed', error: explain(err, next), finishedAt: Date.now() });
        }
      }
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [patch]);

  /**
   * One poll for every server-side item. Runs only while something is actually
   * in flight, so an idle tray costs no requests.
   *
   * The dependency is a digest of what is being watched, not `items` itself:
   * depending on the array would re-arm the interval on every render, and the
   * updater must return `prev` untouched when nothing moved or the resulting
   * new array identity would restart the timer on every tick.
   */
  const watchKey = items
    .filter((it) => it.recordingId && !TERMINAL.has(it.stage))
    .map((it) => `${it.recordingId}:${it.stage}`)
    .join(',');

  useEffect(() => {
    if (!watchKey) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const { recordings } = await api.listRecordings({ limit: 100 });
        if (cancelled) return;
        const byId = new Map(recordings.map((r) => [r.id, r]));
        setItems((prev) => {
          let changed = false;
          const next = prev.map((it) => {
            if (!it.recordingId || TERMINAL.has(it.stage)) return it;
            const row = byId.get(it.recordingId);
            if (!row) return it;
            const stage = STAGE_FROM_STATUS[row.status] ?? it.stage;
            if (stage === it.stage) return it;
            changed = true;
            return {
              ...it,
              stage,
              finishedAt: TERMINAL.has(stage) ? Date.now() : it.finishedAt,
            };
          });
          return changed ? next : prev;
        });
      } catch {
        // Transient poll failure — the next tick retries.
      }
    };
    void tick();
    const timer = window.setInterval(tick, 6000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [watchKey]);

  return { items, addFiles, setPath, remove, clearFinished, start, running };
}
