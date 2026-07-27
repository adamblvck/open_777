// Better Auth web client. Cookie session (credentials:'include') + bearer mirror.
import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from './api';
import { setSessionToken } from './auth-token';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: 'include',
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get('set-auth-token');
      if (token) setSessionToken(token);
    },
  },
});

export type AuthClient = typeof authClient;
