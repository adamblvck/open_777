// Open777 HTTP API client (web). Ported from open777Native/services/api.ts.
// Base URL from VITE_API_BASE_URL (default http://localhost:3777). Cookie session
// (credentials:'include') + bearer-token mirror for non-auth calls.
import { getSessionToken } from './auth-token';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3777';

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOpts {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  noAuth?: boolean;
  timeoutMs?: number;
}

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.body !== undefined && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers ?? {}),
  };
  if (!opts.noAuth) {
    const token = getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = opts.timeoutMs ? setTimeout(() => controller.abort(), opts.timeoutMs) : null;
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      credentials: 'include',
      body: opts.body === undefined ? undefined : opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body),
      signal: controller.signal,
    });
  } finally {
    if (timer) clearTimeout(timer);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body: unknown = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    const b = body as { error?: string; code?: string } | null;
    throw new ApiError(res.status, (b && typeof b.error === 'string' ? b.error : null) ?? `HTTP ${res.status}`, b?.code, body);
  }
  return body as T;
}

// ─── Cloud types (mirror open777-api response shapes) ───
export interface PresignResponse {
  recordingId: string;
  storageKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
  method: 'PUT';
  headers: Record<string, string>;
}
export interface RecordingRow {
  id: string;
  pathNumber: number;
  recordedAt: string;
  durationMs: number;
  status: 'uploaded' | 'transcribing' | 'analyzing' | 'complete' | 'failed';
  sessionId?: string | null;
}
export interface Scene { index: number; title: string; description: string; texturePrompt?: string }
export interface EntityDialogue { speaker: 'entity' | 'practitioner'; text: string }
export interface AnalysisEntity { name: string; kind?: string; description?: string; dialogues?: EntityDialogue[] }
export interface RitualAction { form?: string; category?: string; detail?: string; validation?: Record<string, unknown> }
export interface Analysis { id: string; voice: string; modelUsed?: string; summary?: string; scenes: Scene[]; entities: AnalysisEntity[]; ritualActions: RitualAction[] }
export interface Transcription { language?: string; rawText?: string; text?: string; segments?: { start: number; end: number; text: string }[] }
export interface RecordingDetail {
  recording: RecordingRow;
  audioUrl: string | null;
  transcription: Transcription | null;
  analyses: Analysis[];
}

export interface BillingStatus {
  configured: boolean;
  tier: 'free' | 'monthly' | 'semester' | 'annual';
  active: boolean;
  expiresAt: string | null;
  freeTierPath: number;
}

export const api = {
  health: () => request<{ status: string; db: string; timestamp: string }>('/health', { noAuth: true, timeoutMs: 5000 }),

  // ── Billing (Stripe) ──
  billingStatus: () => request<BillingStatus>('/billing/status'),
  startCheckout: () => request<{ url: string }>('/billing/checkout-session', { method: 'POST' }),
  billingPortal: () => request<{ url: string }>('/billing/portal-session', { method: 'POST' }),

  presignUpload: (input: { pathNumber: number; sessionId?: string; recordedAt: string; durationMs: number; fileSizeBytes: number; contentType?: string }) =>
    request<PresignResponse>('/uploads/presigned', { method: 'POST', body: input }),

  finalizeRecording: (input: { recordingId: string; failed?: boolean }) =>
    request<{ recordingId: string; jobId?: string; status: string }>('/recordings', { method: 'POST', body: input }),

  listRecordings: (params?: { limit?: number; pathNumber?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.pathNumber !== undefined) q.set('pathNumber', String(params.pathNumber));
    const qs = q.toString();
    return request<{ recordings: RecordingRow[] }>(`/recordings${qs ? `?${qs}` : ''}`);
  },

  getRecording: (id: string) => request<RecordingDetail>(`/recordings/${id}`),
  deleteRecording: (id: string) => request<void>(`/recordings/${id}`, { method: 'DELETE' }),
  getJob: (id: string) => request<{ job: unknown }>(`/jobs/${id}`),
  deleteAccount: () => request<void>('/account', { method: 'DELETE' }),
};
