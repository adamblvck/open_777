// Bearer-token mirror (web). Better Auth manages the cookie session; we also
// keep a copy of the `set-auth-token` header here so non-auth API calls
// (uploads, recordings, jobs) can attach Authorization: Bearer <token>.
const KEY = 'open777_session_token';

export function setSessionToken(token: string | null): void {
  try {
    if (token == null || token === '') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearSessionToken(): void {
  setSessionToken(null);
}
