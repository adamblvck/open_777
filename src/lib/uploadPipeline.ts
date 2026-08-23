// Web upload pipeline — ported from open777Native/services/uploadQueue.ts.
// presign → PUT blob to S3 (ONLY presign.headers) → finalize → poll.
import { api, ApiError } from './api';
import type { RecordResult } from '../hooks/useWebAudioRecorder';

export type SyncStatus = 'uploaded' | 'transcribing' | 'analyzing' | 'complete' | 'failed';

export interface UploadResult {
  recordingId: string;
  jobId?: string;
  status: string;
}

export interface UploadOpts {
  /** Called with 0..1 as bytes reach S3. Only fires for the direct PUT. */
  onProgress?: (fraction: number, loaded: number, total: number) => void;
  signal?: AbortSignal;
}

/**
 * PUT the blob straight to S3 with upload progress.
 *
 * XHR rather than fetch: fetch exposes no upload-progress event, and these
 * files run to tens of megabytes — a progress-less minute of silence reads as
 * a hang. Send ONLY presign.headers; any extra header (Authorization, etc.)
 * invalidates the presigned signature.
 */
function putToS3(
  url: string,
  headers: Record<string, string>,
  body: Blob,
  opts: UploadOpts = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(e.loaded / e.total, e.loaded, e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`S3 PUT failed: ${xhr.status} ${String(xhr.responseText ?? '').slice(0, 200)}`));
    xhr.onerror = () => reject(new Error('S3 PUT failed: network error'));
    xhr.onabort = () => reject(new DOMException('Upload aborted', 'AbortError'));

    if (opts.signal) {
      if (opts.signal.aborted) return reject(new DOMException('Upload aborted', 'AbortError'));
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    xhr.send(body);
  });
}

export async function uploadRecording(
  rec: RecordResult,
  pathNumber: number,
  opts: UploadOpts = {}
): Promise<UploadResult> {
  const presign = await api.presignUpload({
    pathNumber,
    sessionId: rec.sessionId,
    recordedAt: rec.recordedAt,
    durationMs: rec.durationMs,
    fileSizeBytes: rec.fileSizeBytes,
    contentType: rec.mimeType, // exact MediaRecorder mime — Whisper accepts webm
  });

  try {
    await putToS3(presign.uploadUrl, presign.headers, rec.blob, opts);
  } catch (err) {
    await api.finalizeRecording({ recordingId: presign.recordingId, failed: true }).catch(() => undefined);
    throw err;
  }

  const finalize = await api.finalizeRecording({ recordingId: presign.recordingId });
  return { recordingId: presign.recordingId, jobId: finalize.jobId, status: finalize.status };
}

export async function pollUntilComplete(
  recordingId: string,
  opts: { intervalMs?: number; maxAttempts?: number; onStatus?: (s: SyncStatus) => void } = {}
): Promise<SyncStatus> {
  const interval = opts.intervalMs ?? 5000;
  const max = opts.maxAttempts ?? 120;
  for (let i = 0; i < max; i++) {
    try {
      const detail = await api.getRecording(recordingId);
      const status = (detail.recording?.status as SyncStatus) ?? 'transcribing';
      opts.onStatus?.(status);
      if (status === 'complete' || status === 'failed') return status;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return 'failed';
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return 'transcribing';
}
