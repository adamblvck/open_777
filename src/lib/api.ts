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

// Response shapes live in apiTypes.ts (types-only, no imports) so a diff
// against the server contract is reviewable on its own.
export type * from './apiTypes';
import type {
  PresignResponse,
  RecordingRow,
  RecordingDetail,
  BillingStatus,
  VisionReport,
  ReportStatusResponse,
  SearchResponse,
  TreeStats,
  PathAggregate,
  MotifEntry,
  EntityEntry,
  CorrespondenceSearchResponse,
} from './apiTypes';

const qs = (params: Record<string, string | number | boolean | undefined>): string => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const api = {
  health: () => request<{ status: string; db: string; timestamp: string }>('/health', { noAuth: true, timeoutMs: 5000 }),

  // ── Billing (Stripe) ──
  billingStatus: () => request<BillingStatus>('/billing/status'),
  startCheckout: () => request<{ url: string }>('/billing/checkout-session', { method: 'POST' }),
  billingPortal: () => request<{ url: string }>('/billing/portal-session', { method: 'POST' }),

  // ── Upload ──
  presignUpload: (input: { pathNumber: number; sessionId?: string; recordedAt: string; durationMs: number; fileSizeBytes: number; contentType?: string }) =>
    request<PresignResponse>('/uploads/presigned', { method: 'POST', body: input }),

  finalizeRecording: (input: { recordingId: string; failed?: boolean }) =>
    request<{ recordingId: string; jobId?: string; status: string }>('/recordings', { method: 'POST', body: input }),

  // ── Recordings ──
  listRecordings: (params?: { limit?: number; pathNumber?: number }) =>
    request<{ recordings: RecordingRow[] }>(`/recordings${qs({ limit: params?.limit, pathNumber: params?.pathNumber })}`),

  getRecording: (id: string) => request<RecordingDetail>(`/recordings/${id}`),
  deleteRecording: (id: string) => request<void>(`/recordings/${id}`, { method: 'DELETE' }),

  // ── Vision report ──
  /**
   * The full report is ~60-130 KB. Never poll this — poll getReportStatus and
   * fetch here once the report exists. `sections` narrows it for tabbed UIs.
   */
  getReport: (id: string, sections?: string[]) =>
    request<VisionReport>(`/recordings/${id}/report${qs({ sections: sections?.join(',') })}`),

  getReportStatus: (id: string) => request<ReportStatusResponse>(`/recordings/${id}/report/status`),

  getReportRevisions: (id: string) =>
    request<{ revisions: Array<{ id: string; revision: number; status: string; verified: boolean; matchScore: number | null; createdAt: string }> }>(
      `/recordings/${id}/report/revisions`,
    ),

  /** Re-runs the report with the adversarial faithfulness audit enabled. */
  verifyReport: (id: string) =>
    request<{ recordingId: string; jobId: string; status: string }>(`/recordings/${id}/report/verify`, { method: 'POST' }),

  // ── Search ──
  search: (params: { q: string; kind?: string; pathNumber?: number; fromSephira?: number; toSephira?: number; from?: string; to?: string; limit?: number; cursor?: string }) =>
    request<SearchResponse>(`/search${qs(params)}`),

  tree: () => request<TreeStats>('/tree'),
  treePath: (pathNumber: number) => request<PathAggregate>(`/tree/paths/${pathNumber}`),

  motifs: (params?: { q?: string; minSessions?: number; limit?: number }) =>
    request<{ motifs: MotifEntry[] }>(`/motifs${qs({ q: params?.q, minSessions: params?.minSessions, limit: params?.limit })}`),

  entities: (params?: { q?: string; minSessions?: number; limit?: number }) =>
    request<{ entities: EntityEntry[] }>(`/entities${qs({ q: params?.q, minSessions: params?.minSessions, limit: params?.limit })}`),

  correspondenceRows: (q?: string) =>
    request<{ rows: Array<{ id: number; rowIndex: string; ord: number }> }>(`/correspondences/rows${qs({ q })}`),

  correspondences: (params: { rowIndex?: string; pathNumber?: number; status?: string; confidence?: string; limit?: number }) =>
    request<CorrespondenceSearchResponse>(`/correspondences${qs(params)}`),

  correspondenceCoverage: () =>
    request<{ coverage: Array<{ liber777Row: string; matched: number; unmatched: number; pathNumbers: number[] }> }>('/correspondences/coverage'),

  // ── Account ──
  deleteAccount: () => request<void>('/account', { method: 'DELETE' }),
};
