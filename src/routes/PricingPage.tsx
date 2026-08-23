import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ApiError, type CatalogProduct, type CatalogResponse, type ProductId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useEntitlement } from '../hooks/useEntitlement';

const price = (cents: number, currency: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

function Card({
  product,
  mentorshipWeeks,
  onBuy,
  busy,
  owned,
}: {
  product: CatalogProduct;
  mentorshipWeeks: number;
  onBuy: (id: ProductId) => void;
  busy: ProductId | null;
  owned: boolean;
}) {
  const featured = product.featured;
  // A per-scrying rate only means something when transcripts are what you are
  // buying. On the mentorship tier most of the price is a person's time, so
  // dividing by credits would advertise a misleadingly expensive transcript.
  const perUnit =
    product.credits && product.credits > 0 && !product.mentorship
      ? `${price(Math.round(product.priceCents / product.credits), product.currency)} a scrying`
      : null;

  return (
    <div
      style={{
        flex: '1 1 300px',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 22,
        padding: '30px 28px 26px',
        background: featured ? 'var(--card)' : 'var(--panel2)',
        boxShadow: featured
          ? 'inset 0 0 0 1px rgba(157,107,255,.45), 0 0 44px rgba(157,107,255,.13)'
          : 'inset 0 0 0 1px var(--line2)',
      }}
    >
      {featured ? (
        <div
          style={{
            alignSelf: 'flex-start',
            fontSize: 10,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color: 'var(--navbg)',
            background: 'var(--purple)',
            padding: '4px 11px',
            borderRadius: 999,
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          The whole Tree
        </div>
      ) : null}

      <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 30, color: 'var(--cream)' }}>
        {product.name}
      </div>
      <div
        style={{
          fontFamily: 'var(--serif2)',
          fontStyle: 'italic',
          fontSize: 15.5,
          color: 'var(--dim)',
          marginTop: 6,
          minHeight: 44,
          lineHeight: 1.45,
        }}
      >
        {product.tagline}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '18px 0 4px' }}>
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 42, color: 'var(--purple2)' }}>
          {price(product.priceCents, product.currency)}
        </span>
        {product.interval ? <span style={{ fontSize: 13, color: 'var(--faint)' }}>{product.interval}</span> : null}
      </div>
      <div style={{ fontSize: 12, color: 'var(--faint)', minHeight: 18 }}>
        {perUnit
          ? `${perUnit} · credits never expire`
          : product.mentorship
            ? `${product.credits} transcripts included · one-off`
            : 'Cancel any time'}
      </div>

      <div style={{ height: 1, background: 'var(--line)', margin: '20px 0 18px' }} />

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        {product.features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--purple)', flex: 'none' }}>✷</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {product.mentorship ? (
        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--panel)',
            boxShadow: 'inset 0 0 0 1px var(--line2)',
            fontSize: 12,
            color: 'var(--dim)',
            lineHeight: 1.5,
          }}
        >
          {mentorshipWeeks} weekly sessions · roughly {Math.round((mentorshipWeeks / 52) * 12)} months of work.
          Places are limited — you'll be asked to pick a weekly slot after checkout.
        </div>
      ) : null}

      <div
        onClick={() => !owned && product.purchasable && !busy && onBuy(product.id)}
        style={{
          marginTop: 22,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 600,
          padding: '13px 22px',
          borderRadius: 999,
          cursor: owned || !product.purchasable || busy ? 'not-allowed' : 'pointer',
          background: featured && !owned && product.purchasable ? 'var(--purple)' : 'var(--card2)',
          color: featured && !owned && product.purchasable ? 'var(--navbg)' : 'var(--muted)',
          boxShadow:
            featured && !owned && product.purchasable
              ? '0 0 24px rgba(157,107,255,.36)'
              : 'inset 0 0 0 1px var(--line2)',
        }}
      >
        {owned
          ? 'Active'
          : !product.purchasable
            ? 'Not on sale yet'
            : busy === product.id
              ? 'Opening checkout…'
              : product.mode === 'subscription'
                ? 'Subscribe'
                : 'Buy'}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<ProductId | null>(null);
  const [params] = useSearchParams();
  const { isSignedIn } = useAuth();
  const ent = useEntitlement();

  useEffect(() => {
    api
      .billingCatalog()
      .then(setCatalog)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load pricing'));
  }, []);

  const buy = async (id: ProductId) => {
    if (!isSignedIn) {
      setError('Sign in first — checkout needs an account to attach the credits to.');
      return;
    }
    setBusy(id);
    setError('');
    try {
      await ent.subscribe(id);
    } catch (e) {
      setError(
        e instanceof ApiError && e.code === 'BILLING_UNCONFIGURED'
          ? 'Billing is not configured on this server yet.'
          : e instanceof Error
            ? e.message
            : 'Could not start checkout'
      );
      setBusy(null);
    }
  };

  const checkout = params.get('checkout');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void2)', padding: '54px 24px 80px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--faint)', textDecoration: 'none' }}>
          ← Back to the overview
        </Link>

        <div style={{ textAlign: 'center', margin: '30px 0 12px' }}>
          <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
            The work, and what it costs
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontWeight: 600,
              fontSize: 52,
              color: 'var(--cream)',
              margin: '10px 0 0',
              lineHeight: 1.1,
            }}
          >
            Walk the Tree
          </h1>
          <p
            style={{
              fontFamily: 'var(--serif2)',
              fontStyle: 'italic',
              fontSize: 18,
              color: 'var(--dim)',
              maxWidth: 620,
              margin: '14px auto 0',
              lineHeight: 1.55,
            }}
          >
            Path {catalog?.freeTierPath ?? 32} is free, always — scry it, upload it, read the report, and
            decide from there whether the rest is worth your money.
          </p>
        </div>

        {checkout === 'success' ? (
          <div
            style={{
              maxWidth: 620,
              margin: '22px auto 0',
              padding: '14px 18px',
              borderRadius: 14,
              background: 'rgba(74,222,128,.08)',
              boxShadow: 'inset 0 0 0 1px rgba(74,222,128,.35)',
              color: '#4ade80',
              fontSize: 13.5,
              textAlign: 'center',
            }}
          >
            Payment received. Your credits appear as soon as Stripe confirms — usually a second or two.
          </div>
        ) : null}

        {isSignedIn && (ent.credits > 0 || ent.active) ? (
          <div
            style={{
              maxWidth: 620,
              margin: '22px auto 0',
              padding: '13px 18px',
              borderRadius: 14,
              background: 'var(--card)',
              boxShadow: 'inset 0 0 0 1px var(--line2)',
              color: 'var(--muted)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            {ent.active ? 'Your subscription is active. ' : ''}
            {ent.credits > 0
              ? `${ent.credits} transcript${ent.credits === 1 ? '' : 's'} left` +
                (ent.status?.creditsGranted ? ` of ${ent.status.creditsGranted} bought.` : '.')
              : ''}
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              maxWidth: 620,
              margin: '22px auto 0',
              padding: '13px 18px',
              borderRadius: 14,
              background: 'rgba(224,70,75,.08)',
              boxShadow: 'inset 0 0 0 1px rgba(224,70,75,.35)',
              color: 'var(--danger)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        ) : null}

        {catalog && !catalog.configured ? (
          <div
            style={{
              maxWidth: 620,
              margin: '22px auto 0',
              padding: '13px 18px',
              borderRadius: 14,
              background: 'rgba(240,178,50,.07)',
              boxShadow: 'inset 0 0 0 1px rgba(240,178,50,.3)',
              color: '#f0b232',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            Billing is not configured on this server — prices are shown for reference only.
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
            alignItems: 'stretch',
            marginTop: 40,
          }}
        >
          {catalog?.products.map((p) => (
            <Card
              key={p.id}
              product={p}
              mentorshipWeeks={catalog.mentorshipWeeks}
              onBuy={buy}
              busy={busy}
              owned={p.mode === 'subscription' ? ent.active : p.mentorship ? Boolean(ent.status?.mentorship) : false}
            />
          ))}
          {!catalog && !error ? <div style={{ color: 'var(--faint)', fontSize: 14 }}>Loading…</div> : null}
        </div>

        <div
          style={{
            maxWidth: 760,
            margin: '54px auto 0',
            fontSize: 13,
            color: 'var(--faint)',
            lineHeight: 1.7,
            textAlign: 'center',
          }}
        >
          One credit is one recording carried the whole way: transcribed, cut into scenes, read for
          entities, ritual actions and correspondences, and cross-referenced against everything you
          have scried before. Credits are drawn from whichever pack you bought and never expire.
          {isSignedIn && ent.active ? (
            <>
              {' '}
              <span onClick={() => ent.manage()} style={{ color: 'var(--purple)', cursor: 'pointer' }}>
                Manage billing →
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
