import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type BillingStatus, type ProductId } from '../lib/api';
import { useAuth } from './useAuth';

export interface Entitlement {
  status: BillingStatus | null;
  loading: boolean;
  /** True once we know the user has an active paid subscription. */
  active: boolean;
  /** Unspent one-off transcript credits. */
  credits: number;
  /** Subscription OR credits — i.e. can process a non-free path right now. */
  canProcess: boolean;
  /** Free path (Tau/32) everyone may process without paying. */
  freeTierPath: number;
  /** Whether processing this path is currently blocked for the user. */
  needsSubscription: (pathNumber: number) => boolean;
  /** Start Stripe Checkout for a product and redirect the browser to it. */
  subscribe: (productId?: ProductId) => Promise<void>;
  /** Open the Stripe billing portal (manage/cancel). */
  manage: () => Promise<void>;
  refetch: () => void;
}

/**
 * Subscription + credit entitlement for the signed-in user. Mirrors the API's
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
  const credits = status?.credits ?? 0;
  const canProcess = active || credits > 0;

  return {
    status,
    loading,
    active,
    credits,
    canProcess,
    freeTierPath,
    // A credit is as good as a subscription for getting one recording through.
    needsSubscription: (pathNumber: number) => pathNumber !== freeTierPath && !canProcess,
    subscribe: async (productId: ProductId = 'tree_pack') => {
      const { url } = await api.startCheckout(productId);
      window.location.href = url;
    },
    manage: async () => {
      const { url } = await api.billingPortal();
      window.location.href = url;
    },
    refetch,
  };
}
