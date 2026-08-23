// Better Auth web client. Token-first, with the cookie session as a fallback.
import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from './api';
import { getSessionToken, setSessionToken } from './auth-token';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    // Kept so the cookie still works where the browser allows it — same-site in
    // dev, and cross-site in browsers that honour SameSite=None.
    credentials: 'include',

    // ...but the token is what actually carries the session. In production the
    // web app and the API are on different registrable domains, and Safari's
    // tracking prevention drops the SameSite=None cookie no matter what
    // attributes the server sets. Without this, useSession() and signOut() —
    // which go through this client rather than lib/api.ts — would 401 in Safari
    // even though every other API call succeeded on its bearer header.
    //
    // The token is also what makes moving the API to a custom domain later a
    // config change instead of a forced re-login: a token is keyed by the
    // sessions table, a cookie is keyed by domain and cannot follow.
    //
    // `token` is evaluated per request, so it picks up a sign-in that happened
    // after this module was constructed.
    auth: {
      type: 'Bearer',
      token: () => getSessionToken() ?? undefined,
    },

    onSuccess: (ctx) => {
      // Requires the server to list set-auth-token in
      // Access-Control-Expose-Headers; otherwise this reads null cross-origin
      // and the whole token path silently degrades to cookies-only.
      // See open777-api/src/lib/cors.ts.
      const token = ctx.response.headers.get('set-auth-token');
      if (token) setSessionToken(token);
    },
  },
});

export type AuthClient = typeof authClient;
