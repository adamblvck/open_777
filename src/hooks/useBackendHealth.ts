import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/api';

export interface BackendHealth {
  online: boolean; // the API responded with a health body
  db: boolean; // the database is connected
  checking: boolean;
}

/**
 * Polls /health so the UI can show backend/db status and gate cloud features.
 * The endpoint returns 503 (with a body) when the DB is down — that's still
 * "online" (the API responded), just degraded.
 */
export function useBackendHealth(intervalMs = 30000): BackendHealth {
  const [state, setState] = useState<BackendHealth>({ online: false, db: false, checking: true });
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { credentials: 'include' });
        const body = (await res.json().catch(() => null)) as { status?: string; db?: string } | null;
        if (!alive) return;
        const online = !!(body && typeof body.status === 'string');
        setState({ online, db: body?.db === 'connected', checking: false });
      } catch {
        if (alive) setState({ online: false, db: false, checking: false });
      }
    };
    check();
    const t = setInterval(check, intervalMs);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [intervalMs]);
  return state;
}
