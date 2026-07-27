import type {
  Analysis,
  RecordingDetail,
  ReportScene,
  ReportScenePiece,
  VisionReport,
  Verdict,
} from '../apiTypes';

/**
 * Turns whatever the API returned into one shape the renderer can trust.
 *
 * This is a coercer, not a validator — it never throws. Every recording in the
 * user's history predates the vision report, and a recording being analysed
 * right now has no report at all, so degradation is the normal case rather
 * than an edge case.
 */

export type ReportKind = 'rich' | 'legacy' | 'pending' | 'failed' | 'empty';

/** A scene merged with its deep piece — the renderer never juggles two arrays. */
export interface MergedScene {
  sceneNumber: number;
  title: string;
  summary: string;
  mood: string;
  dominantColors: string[];
  keySymbols: string[];
  startMs: number | null;
  endMs: number | null;
  startText: string;
  endText: string;
  piece: ReportScenePiece | null;
  verdict: Verdict | null;
}

export interface NormalizedReport {
  kind: ReportKind;
  /** Why the report is not rich — shown to the user, never a bare spinner. */
  reason: string | null;
  report: VisionReport | null;
  legacy: Analysis | null;
  scenes: MergedScene[];
  matchScore: number | null;
  sections: {
    scenes: boolean;
    pieces: boolean;
    crossref: boolean;
    archetypes: boolean;
    moodboard: boolean;
    voices: boolean;
    verified: boolean;
  };
}

/**
 * Timestamps arrive as integer ms from the API but as "MM:SS" / "HH:MM:SS"
 * strings in the hand-built reference bundles. Accept both.
 */
export function parseClock(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);

  const m = /(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(trimmed);
  if (!m) return null;
  const a = Number.parseInt(m[1]!, 10);
  const b = Number.parseInt(m[2]!, 10);
  const seconds = m[3] ? a * 3600 + b * 60 + Number.parseInt(m[3], 10) : a * 60 + b;
  return seconds * 1000;
}

/** ms → "MM:SS", or "H:MM:SS" past an hour. */
export function formatClock(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return '—';
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const asArray = <T,>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : []);

function mergeScenes(scenes: ReportScene[], pieces: ReportScenePiece[]): MergedScene[] {
  // scenes[] and scenePieces[] are parallel arrays joined on sceneNumber. A
  // scene whose piece failed still renders, from its stage-1 summary.
  const pieceByNumber = new Map(pieces.map((p) => [p.sceneNumber, p]));
  return [...scenes]
    .sort((a, b) => a.sceneNumber - b.sceneNumber)
    .map((s) => {
      const piece = pieceByNumber.get(s.sceneNumber) ?? null;
      return {
        sceneNumber: s.sceneNumber,
        title: s.title ?? `Scene ${s.sceneNumber}`,
        summary: s.summary ?? '',
        mood: s.mood ?? '',
        dominantColors: asArray(s.dominantColors),
        keySymbols: asArray(s.keySymbols),
        startMs: parseClock(s.startMs),
        endMs: parseClock(s.endMs),
        startText: s.startText ?? '',
        endText: s.endText ?? '',
        piece,
        verdict: piece?.verdict ?? piece?.verification?.verdict ?? null,
      };
    });
}

/** Legacy analyses have `index`, not `sceneNumber`, and no piece. */
function legacyScenes(analysis: Analysis): MergedScene[] {
  return asArray(analysis.scenes)
    .slice()
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((s, i) => ({
      sceneNumber: s.index ?? i + 1,
      title: s.title ?? `Scene ${i + 1}`,
      summary: s.description ?? '',
      mood: '',
      dominantColors: [],
      keySymbols: [],
      startMs: parseClock(s.startMs),
      endMs: parseClock(s.endMs),
      startText: '',
      endText: '',
      piece: null,
      verdict: null,
    }));
}

export function normalizeReport(
  detail: RecordingDetail | null | undefined,
  report: VisionReport | null | undefined,
): NormalizedReport {
  const empty: NormalizedReport = {
    kind: 'empty',
    reason: null,
    report: null,
    legacy: null,
    scenes: [],
    matchScore: null,
    sections: {
      scenes: false,
      pieces: false,
      crossref: false,
      archetypes: false,
      moodboard: false,
      voices: false,
      verified: false,
    },
  };

  if (!detail) return empty;

  const status = detail.recording?.status;

  if (report && (report.status === 'complete' || report.status === 'partial')) {
    const scenes = asArray(report.scenes);
    const pieces = asArray(report.scenePieces);
    return {
      kind: 'rich',
      reason:
        report.status === 'partial'
          ? 'Some stages of this reading did not finish — the sections below are what completed.'
          : null,
      report,
      legacy: detail.analyses?.[0] ?? null,
      scenes: mergeScenes(scenes, pieces),
      matchScore: report.matchScore ?? report.crossref?.matchScore ?? report.meta?.matchScore ?? null,
      sections: {
        scenes: scenes.length > 0,
        pieces: pieces.length > 0,
        crossref: Boolean(report.crossref),
        archetypes: Boolean(report.archetypes),
        moodboard: Boolean(report.moodboard),
        voices: asArray(report.voiceReadings).length > 0,
        verified: Boolean(report.verified),
      },
    };
  }

  if (status === 'failed') {
    return {
      ...empty,
      kind: 'failed',
      reason: 'This recording could not be processed.',
      legacy: detail.analyses?.[0] ?? null,
    };
  }

  if (status === 'uploaded' || status === 'transcribing' || status === 'analyzing') {
    return {
      ...empty,
      kind: 'pending',
      reason:
        status === 'analyzing'
          ? 'Reading the vision — this takes a few minutes.'
          : 'Transcribing the recording.',
    };
  }

  // Complete, but no rich report: every recording made before the vision-report
  // pipeline landed is in this state, and it is a normal thing to open.
  const legacy = detail.analyses?.[0] ?? null;
  if (legacy) {
    return {
      ...empty,
      kind: 'legacy',
      reason: 'This reading predates the full vision report.',
      legacy,
      scenes: legacyScenes(legacy),
    };
  }

  return empty;
}

/** Colour for a verification verdict; null when unverified. */
export function verdictTone(verdict: Verdict | null): { label: string; color: string } | null {
  if (!verdict) return null;
  if (verdict === 'faithful') return { label: 'faithful', color: '#34c08a' };
  if (verdict === 'minor-issues') return { label: 'minor issues', color: '#b9a44a' };
  return { label: 'major issues', color: '#e0464b' };
}

/** Band a 0-100 fidelity score. Thresholds match the pipeline's own calibration. */
export function scoreTone(score: number | null): { label: string; color: string } {
  if (score === null) return { label: 'not scored', color: '#7d7790' };
  if (score >= 70) return { label: 'strongly on-signature', color: '#34c08a' };
  if (score >= 45) return { label: 'partly on-signature', color: '#b9a44a' };
  return { label: 'off-signature', color: '#e0464b' };
}

export function confidenceTone(confidence: string | null): string {
  if (confidence === 'exact') return '#34c08a';
  if (confidence === 'close') return '#b9a44a';
  if (confidence === 'symbolic') return '#9d6bff';
  return '#7d7790';
}
