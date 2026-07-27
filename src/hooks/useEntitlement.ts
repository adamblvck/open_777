import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type BillingStatus } from '../lib/api';
import { useAuth } from './useAuth';

export interface Entitlement {
  status: BillingStatus | null;
  loading: boolean;
  /** True once we know the user has an active paid subscription. */
  active: boolean;
  /** Free path (Tau/32) everyone may process without paying. */
  freeTierPath: number;
  /** Whether processing this path requires a subscription the user lacks. */
  needsSubscription: (pathNumber: number) => boolean;
  /** Start Stripe Checkout and redirect the browser to it. */
  subscribe: () => Promise<void>;
  /** Open the Stripe billing portal (manage/cancel). */
  manage: () => Promise<void>;
  refetch: () => void;
}

/**
 * Subscription entitlement for the signed-in user. Mirrors the API's
 * GET /billing/status and drives the paywall in the scrying workspace.
 */
export function useEntitlement(): Entitlement {
  const { isSignedIn } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!isSignedIn) {
      setStatus(null);
      return;
    }
    setLoading(true);
    api
      .billingStatus()
      .then(setStatus)
      .catch((e) => {
        // 401 before session settles is fine; anything else leaves status null.
        if (!(e instanceof ApiError && e.status === 401)) console.warn('billingStatus failed', e);
        setStatus(null);
      })
      .finally(() => setLoading(false));
  }, [isSignedIn]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const freeTierPath = status?.freeTierPath ?? 32;
  const active = status?.active ?? false;

  return {
    status,
    loading,
    active,
    freeTierPath,
    needsSubscription: (pathNumber: number) => pathNumber !== freeTierPath && !active,
    subscribe: async () => {
      const { url } = await api.startCheckout();
      window.location.href = url;
    },
    manage: async () => {
      const { url } = await api.billingPortal();
      window.location.href = url;
    },
    refetch,
  };
}
