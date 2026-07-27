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

export async function uploadRecording(rec: RecordResult, pathNumber: number): Promise<UploadResult> {
  const presign = await api.presignUpload({
    pathNumber,
    sessionId: rec.sessionId,
    recordedAt: rec.recordedAt,
    durationMs: rec.durationMs,
    fileSizeBytes: rec.fileSizeBytes,
    contentType: rec.mimeType, // exact MediaRecorder mime — Whisper accepts webm
  });

  // Direct-to-S3 PUT. Send ONLY presign.headers — adding Authorization or
  // other headers breaks the presigned-URL signature. No credentials.
  const put = await fetch(presign.uploadUrl, { method: 'PUT', headers: presign.headers, body: rec.blob });
  if (!put.ok) {
    await api.finalizeRecording({ recordingId: presign.recordingId, failed: true }).catch(() => undefined);
    throw new Error(`S3 PUT failed: ${put.status}`);
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
