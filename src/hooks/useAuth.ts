import { authClient } from '../lib/auth';
import { clearSessionToken } from '../lib/auth-token';

export function useAuth() {
  const { data, isPending, error, refetch } = authClient.useSession();
  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    isLoading: isPending,
    isSignedIn: !!data?.user,
    error: error ?? null,
    signOut: async () => {
      try {
        await authClient.signOut();
      } finally {
        clearSessionToken();
      }
    },
    refetch,
  };
}
