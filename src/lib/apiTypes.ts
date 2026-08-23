/**
 * Response shapes of open777-api.
 *
 * Hand-mirrored: there is no shared package or codegen between the repos yet.
 * Keep this file types-only (zero imports) so a diff against the server is
 * reviewable on its own. `reportVersion` on VisionReport is the contract
 * marker — bump it server-side when the shape changes and switch on it in
 * `report/normalize.ts`.
 */

// ─── Upload + recordings ─────────────────────────────────────

export interface PresignResponse {
  recordingId: string;
  storageKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
  method: 'PUT';
  headers: Record<string, string>;
}

export type RecordingStatus =
  | 'uploaded'
  | 'transcribing'
  | 'analyzing'
  | 'complete'
  | 'failed';

export interface RecordingRow {
  id: string;
  pathNumber: number;
  recordedAt: string;
  durationMs: number;
  status: RecordingStatus;
  sessionId?: string | null;
}

// ─── Legacy analysis (still returned by GET /recordings/:id) ──

export interface Scene {
  index: number;
  title: string;
  description: string;
  texturePrompt?: string;
  startMs?: number | null;
  endMs?: number | null;
}
export interface EntityDialogue {
  speaker: 'entity' | 'practitioner';
  text: string;
}
export interface AnalysisEntity {
  name: string;
  kind?: string;
  description?: string;
  dialogues?: EntityDialogue[];
}
export interface RitualAction {
  form?: string;
  category?: string;
  detail?: string;
  validation?: Record<string, unknown>;
}
export interface Analysis {
  id: string;
  voice: string;
  modelUsed?: string;
  summary?: string;
  scenes: Scene[];
  entities: AnalysisEntity[];
  ritualActions: RitualAction[];
}
export interface Transcription {
  language?: string;
  rawText?: string;
  text?: string;
  wordCount?: number;
  modelUsed?: string;
  segments?: { start: number; end: number; text: string }[];
}

export interface RecordingDetail {
  recording: RecordingRow;
  audioUrl: string | null;
  transcription: Transcription | null;
  analyses: Analysis[];
  /** Additive: is there a rich vision report? */
  reportAvailable?: boolean;
  reportUrl?: string | null;
}

// ─── Vision report ───────────────────────────────────────────

export type Verdict = 'faithful' | 'minor-issues' | 'major-issues';
export type Confidence = 'exact' | 'close' | 'symbolic';
export type Salience = 'high' | 'medium' | 'low';
export type Evidence = 'witnessed' | 'inferred';

export interface ReportScene {
  id: string;
  sceneNumber: number;
  title: string;
  summary: string | null;
  mood: string | null;
  dominantColors: string[] | null;
  keySymbols: string[] | null;
  startMs: number | null;
  endMs: number | null;
  startText: string | null;
  endText: string | null;
}

export interface ReportEntity {
  id: string;
  name: string;
  kind: string | null;
  description: string | null;
  evidence: Evidence | null;
  engagementType: string | null;
  banishingTest: string | null;
  dialogues: EntityDialogue[] | null;
}

export interface ReportRitualAction {
  id: string;
  form: string | null;
  category: string | null;
  detail: string | null;
  godNamesUsed: string[] | null;
  validationNote: string | null;
}

export interface TranscriptCorrection {
  heard: string;
  probable: string;
  confidence: 'high' | 'medium' | 'low';
  note: string | null;
}

export interface VerificationIssue {
  claim: string;
  status: 'confirmed' | 'unsupported' | 'contradicted';
  note: string;
}

export interface Verification {
  sceneNumber: number;
  verdict: Verdict;
  issues: VerificationIssue[];
  correctedPiece: string | null;
}

export interface ReportScenePiece {
  sceneNumber: number;
  piece: string;
  archetypalNotes: string | null;
  transcriptCorrections: TranscriptCorrection[] | null;
  textures: string[] | null;
  verdict: Verdict | null;
  verification: Verification | null;
  entities: ReportEntity[];
  ritualActions: ReportRitualAction[];
}

export interface CorrespondenceObservation {
  id: string;
  status: 'matched' | 'unmatched' | 'unexpected';
  category: string | null;
  liber777Row: string | null;
  expected: string | null;
  witnessed: string | null;
  confidence: Confidence | null;
  sourceQuote: string | null;
  explanation: string | null;
}

export interface ReportCrossref {
  matchScore: number | null;
  summary: string | null;
  ritualValidation: {
    pathCategory: string | null;
    expectedRitualForm: string | null;
    actualRitualForm: string | null;
    isCorrect: boolean | null;
    notes: string | null;
  };
  matchedCorrespondences: CorrespondenceObservation[];
  unmatchedCorrespondences: CorrespondenceObservation[];
  unexpectedElements: CorrespondenceObservation[];
}

export interface ReportTheme {
  id: string;
  name: string;
  description: string | null;
  transcriptEvidence: string | null;
}

export interface ReportMotif {
  id: string;
  motif: string;
  motifKey: string;
  note: string | null;
  recurrenceHint: string | null;
  pathNumber: number;
}

export interface ReportArchetypes {
  jungianReading: string | null;
  hermeticReading: string | null;
  integrationSuggestions: string[] | null;
  coreThemes: ReportTheme[];
  personalMotifs: ReportMotif[];
}

export interface PaletteSwatch {
  id: string;
  name: string;
  hex: string | null;
  source: string | null;
  note: string | null;
  liber777Match: string | null;
  ord: number;
}

export interface MoodboardItem {
  id: string;
  name: string;
  kind: string | null;
  description: string | null;
  characteristics: string | null;
  salience: Salience | null;
  sourceQuote: string | null;
  sceneRefs: number[] | null;
}

export interface ReportMoodboard {
  atmosphere: string | null;
  texturePrompts: string[] | null;
  palette: PaletteSwatch[];
  items: MoodboardItem[];
}

export interface VoiceReading {
  id: string;
  voice: string;
  body: string;
  modelUsed: string | null;
}

export interface ReportMeta {
  path: number;
  letter: string | null;
  attribution: string | null;
  tarot: string | null;
  fromSephira: number | null;
  toSephira: number | null;
  transcribedWords: number;
  recordedDurationSec: number | null;
  transcriptionModel: string | null;
  analysisModel: string;
  analysisDate: string;
  matchScore: number | null;
  verified: boolean;
}

export type ReportStatus = 'pending' | 'running' | 'partial' | 'complete' | 'failed';

export interface VisionReport {
  reportId: string;
  recordingId: string;
  revision: number;
  status: ReportStatus;
  pathNumber: number;
  verified: boolean;
  matchScore: number | null;
  reportVersion: number;
  meta?: ReportMeta | null;
  scenes?: ReportScene[];
  scenePieces?: ReportScenePiece[];
  crossref?: ReportCrossref | null;
  archetypes?: ReportArchetypes | null;
  moodboard?: ReportMoodboard | null;
  voiceReadings?: VoiceReading[];
}

export interface ReportStatusResponse {
  recordingId: string;
  recordingStatus: RecordingStatus;
  reportId: string | null;
  reportStatus: ReportStatus | null;
  verified: boolean;
  matchScore: number | null;
  errorMessage: string | null;
  progress: number;
  jobs: Array<{
    type: string;
    status: 'queued' | 'processing' | 'complete' | 'failed';
    attempts: number;
    errorMessage: string | null;
    createdAt: string;
    completedAt: string | null;
  }>;
  stages: Array<{
    stage: string;
    key: string;
    status: string;
    attempts: number;
    ms: number | null;
  }>;
}

// ─── Search ──────────────────────────────────────────────────

export type SearchKind =
  | 'transcript'
  | 'scene_piece'
  | 'archetype'
  | 'crossref_summary'
  | 'entity'
  | 'motif'
  | 'moodboard_item'
  | 'theme';

export interface SearchHit {
  kind: SearchKind;
  recordingId: string;
  reportId: string | null;
  refId: string | null;
  pathNumber: number | null;
  sceneNumber: number | null;
  title: string | null;
  /** Offsets, not HTML — the corpus is user speech, so never render as markup. */
  snippet: { text: string; highlights: Array<[number, number]> };
  rank: number;
  recordedAt: string | null;
}

export interface SearchResponse {
  results: SearchHit[];
  nextCursor: string | null;
  facets: { byKind: Record<string, number>; byPath: Record<string, number> };
}

export interface TreePath {
  pathNumber: number;
  letter: string | null;
  letterTranslit: string | null;
  letterMeaning: string | null;
  attribution: string | null;
  trump: string | null;
  intelligence: string | null;
  fromSephira: number | null;
  toSephira: number | null;
  colors: { king: string | null; queen: string | null };
  sessionCount: number;
  reportCount: number;
  avgMatchScore: number | null;
  lastRecordedAt: string | null;
}

export interface TreeSephira {
  number: number;
  name: string | null;
  translit: string | null;
  title: string | null;
  sessionCount: number;
}

export interface TreeStats {
  paths: TreePath[];
  sephiroth: TreeSephira[];
  unplacedCount: number;
}

export interface PathAggregate {
  pathNumber: number;
  sessions: Array<{
    recordingId: string;
    recordedAt: string | null;
    durationMs: number | null;
    status: RecordingStatus;
    reportId: string | null;
    reportStatus: ReportStatus | null;
    matchScore: number | null;
  }>;
  motifs: Array<{
    motifKey: string;
    label: string;
    sessionCount: number;
    reportIds: string[];
    lastSeen: string | null;
  }>;
  witnessed: Array<{
    liber777Row: string | null;
    category: string | null;
    expected: string | null;
    timesWitnessed: number;
    exampleQuote: string | null;
    bestConfidence: Confidence | null;
  }>;
  stillUnmatched: Array<{
    liber777Row: string | null;
    category: string | null;
    expected: string | null;
    missedCount: number;
  }>;
}

export interface MotifEntry {
  motifKey: string;
  label: string;
  sessionCount: number;
  pathNumbers: number[];
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  note: string | null;
  recurrenceHint: string | null;
}

export interface EntityEntry {
  nameKey: string;
  label: string;
  sessionCount: number;
  pathNumbers: number[];
  kind: string | null;
  description: string | null;
}

export interface CorrespondenceSearchResponse {
  observations: Array<
    CorrespondenceObservation & {
      reportId: string;
      recordingId: string;
      pathNumber: number;
      matchScore: number | null;
      recordedAt: string | null;
    }
  >;
  counts: { matched: number; unmatched: number; unexpected: number };
}

export interface BillingStatus {
  configured: boolean;
  tier: 'free' | 'monthly' | 'semester' | 'annual';
  active: boolean;
  expiresAt: string | null;
  freeTierPath: number;
  /** Unspent transcript credits from one-off packs. */
  credits: number;
  /** Lifetime credits granted — for "14 of 96 used". */
  creditsGranted: number;
  mentorship: boolean;
  mentorshipExpiresAt: string | null;
  /**
   * Which provider backs the active subscription; null when there isn't one.
   * Decides whether "Manage" opens the Stripe portal or the store's own
   * subscription sheet — an IAP subscriber has no Stripe customer to send to
   * the portal, and vice versa.
   */
  provider: 'stripe' | 'revenuecat' | null;
}

export interface PathEvidence {
  kind: 'letter' | 'trump' | 'attribution' | 'letter_meaning' | 'intelligence' | 'explicit_number';
  term: string;
  weight: number;
  quote: string;
}

export interface PathSuggestion {
  pathNumber: number;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  label: string;
  evidence: PathEvidence[];
}

export interface PathSuggestionsResponse {
  recordingId: string;
  pathNumber: number;
  /** False while the recording has no transcript yet. */
  ready: boolean;
  suggestions: PathSuggestion[];
}

export type ProductId = 'tree_pack' | 'adept_circle' | 'monthly';

export interface CatalogProduct {
  id: ProductId;
  mode: 'payment' | 'subscription';
  name: string;
  tagline: string;
  /** null = unlimited while the subscription is active. */
  credits: number | null;
  priceCents: number;
  currency: string;
  interval: string | null;
  features: string[];
  mentorship: boolean;
  featured: boolean;
  /** False when Stripe has no price id for it — render the card, disable the button. */
  purchasable: boolean;
  /**
   * Store SKU (App Store / Play / RevenueCat) when this product is sold in-app.
   * null on web-only products, which have no store product by design.
   */
  storeProductId: string | null;
}

export interface CatalogResponse {
  configured: boolean;
  currency: string;
  freeTierPath: number;
  mentorshipWeeks: number;
  products: CatalogProduct[];
}
