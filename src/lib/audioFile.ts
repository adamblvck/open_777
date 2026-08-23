// Dropped/picked audio files → the RecordResult shape the upload pipeline
// already speaks, plus filename → path-number inference.
//
// The recorder produces RecordResult from MediaRecorder; a file drop has to
// synthesise the same fields. Duration is the only one that needs real work:
// the presign endpoint rejects durationMs <= 0, so a metadata read that fails
// must still yield a positive estimate rather than blocking the upload.
import type { RecordResult } from '../hooks/useWebAudioRecorder';
import { paths } from '../data/paths';

const AUDIO_EXT = /\.(m4a|mp3|mp4|wav|webm|ogg|oga|aac|flac|aiff?|caf)$/i;

/** Accept by MIME when the browser knows it, else fall back to the extension. */
export function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  // Voice-memo .m4a often arrives as video/mp4 or with an empty type.
  if (file.type === 'video/mp4' || file.type === '') return AUDIO_EXT.test(file.name);
  return AUDIO_EXT.test(file.name);
}

/**
 * Content type to sign the S3 PUT with. Must be echoed verbatim on the PUT or
 * the presigned signature breaks, so normalise here once and reuse.
 */
export function contentTypeFor(file: File): string {
  if (file.type && file.type !== 'video/mp4') return file.type;
  if (/\.m4a$/i.test(file.name)) return 'audio/mp4';
  if (/\.mp3$/i.test(file.name)) return 'audio/mpeg';
  if (/\.wav$/i.test(file.name)) return 'audio/wav';
  return file.type || 'audio/mp4';
}

/** Rough duration from size, used only when metadata decoding fails. ~128 kbps. */
function estimateDurationMs(bytes: number): number {
  return Math.max(1000, Math.round((bytes * 8) / 128_000) * 1000);
}

/**
 * Read duration via a detached <audio> element. Resolves to an estimate rather
 * than rejecting: a missing duration must not block an otherwise valid upload.
 */
export function readDurationMs(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('audio');
    let settled = false;
    const finish = (ms: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(ms > 0 ? ms : estimateDurationMs(file.size));
    };
    const timer = setTimeout(() => finish(0), 20_000);
    el.preload = 'metadata';
    el.onloadedmetadata = () => finish(Number.isFinite(el.duration) ? Math.round(el.duration * 1000) : 0);
    el.onerror = () => finish(0);
    el.src = url;
  });
}

export async function fileToRecordResult(file: File): Promise<RecordResult> {
  const durationMs = await readDurationMs(file);
  return {
    blob: file,
    durationMs,
    fileSizeBytes: file.size,
    mimeType: contentTypeFor(file),
    // Voice memos carry their capture time in lastModified; fall back to now.
    recordedAt: new Date(file.lastModified || Date.now()).toISOString(),
    sessionId: `file-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

// ── Filename → path number ───────────────────────────────────────────────

export type GuessSource = 'filename' | 'trump' | 'none';

export interface PathGuess {
  /** Recorder-space path number (0 General, 1-32 tree, 33 = "32 bis", 34 = "31 bis"). */
  pathNumber: number | null;
  source: GuessSource;
  /** Human explanation of how the guess was made, shown under the file row. */
  reason: string;
  /** Set when the filename's number and its trump name disagree. */
  conflict?: string;
}

/** Trump title → canonical path number, from the same table the UI renders. */
const TRUMP_TO_PATH: Array<[RegExp, number, string]> = paths.map((p) => [
  // "The Hanged Man" → matches "hanged man" with or without the article.
  new RegExp(`\\b${p.trump.replace(/^The\s+/i, '(the\\s+)?').replace(/\s+/g, '\\s+')}\\b`, 'i'),
  p.num,
  p.trump,
]);

/**
 * Infer the path from a filename such as "Path 27 - The Tower 2.m4a".
 *
 * The explicit number always wins: Crowley's "Tzaddi is not the Star" swap
 * means a practitioner may legitimately file The Emperor under 28, so a
 * trump/number disagreement is reported as a conflict, never silently applied.
 */
export function inferPathFromFilename(filename: string): PathGuess {
  const stem = filename.replace(/\.[^.]+$/, '');

  // "31 bis" / "32 bis" ride on their own recorder slots (34 / 33).
  const bis = stem.match(/\b(3[12])\s*[-–—]?\s*bis\b/i);
  if (bis) {
    const base = Number(bis[1]);
    const n = base === 32 ? 33 : 34;
    return { pathNumber: n, source: 'filename', reason: `"${base} bis" in the filename` };
  }

  const explicit = stem.match(/\bpath\s*[-–—:.]?\s*(\d{1,2})\b/i);
  const byNumber = explicit ? Number(explicit[1]) : null;

  let byTrump: { num: number; trump: string } | null = null;
  for (const [re, num, trump] of TRUMP_TO_PATH) {
    if (re.test(stem)) {
      byTrump = { num, trump };
      break;
    }
  }

  if (byNumber !== null && byNumber >= 0 && byNumber <= 32) {
    if (byTrump && byTrump.num !== byNumber) {
      return {
        pathNumber: byNumber,
        source: 'filename',
        reason: `"Path ${byNumber}" in the filename`,
        conflict: `The filename also names ${byTrump.trump}, which is canonically Path ${byTrump.num}. Keeping ${byNumber} — the Emperor/Star swap makes this a deliberate choice for some practitioners.`,
      };
    }
    return { pathNumber: byNumber, source: 'filename', reason: `"Path ${byNumber}" in the filename` };
  }

  if (byTrump) {
    return {
      pathNumber: byTrump.num,
      source: 'trump',
      reason: `Named "${byTrump.trump}" → Path ${byTrump.num}`,
    };
  }

  return {
    pathNumber: null,
    source: 'none',
    reason: 'No path in the filename — set one, or upload as General and let the transcript suggest it.',
  };
}
