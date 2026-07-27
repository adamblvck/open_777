import { useCallback, useRef, useState } from 'react';

export interface RecordResult {
  blob: Blob;
  durationMs: number;
  fileSizeBytes: number;
  mimeType: string;
  recordedAt: string;
  sessionId: string;
}

function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const c of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return '';
}

export function recorderSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
}

/** Browser audio recorder (MediaRecorder → webm/opus, or mp4 on Safari). */
export function useWebAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef('');

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
  };

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mimeType = pickMime();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    rec.start();
    recRef.current = rec;
    sessionRef.current = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    startRef.current = Date.now();
    setDurationMs(0);
    setIsRecording(true);
    timerRef.current = window.setInterval(() => setDurationMs(Date.now() - startRef.current), 250);
  }, []);

  const stop = useCallback(
    () =>
      new Promise<RecordResult | null>((resolve) => {
        const rec = recRef.current;
        if (!rec) return resolve(null);
        rec.onstop = () => {
          const mimeType = rec.mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });
          cleanup();
          setIsRecording(false);
          resolve({ blob, durationMs: Date.now() - startRef.current, fileSizeBytes: blob.size, mimeType, recordedAt: new Date(startRef.current).toISOString(), sessionId: sessionRef.current });
        };
        rec.stop();
      }),
    []
  );

  const discard = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* already stopped */ }
    cleanup();
    setIsRecording(false);
    setDurationMs(0);
  }, []);

  return { isRecording, durationMs, start, stop, discard };
}
