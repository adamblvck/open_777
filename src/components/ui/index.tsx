import type { CSSProperties, ReactNode } from 'react';

/**
 * The six idioms that were copy-pasted across every workspace.
 *
 * Deliberately plain functions returning inline-styled divs — that is the
 * convention in the new TS surfaces (Tailwind lives only in the legacy .jsx
 * islands). Borders are `inset` box-shadows, never `border`, so nothing shifts
 * layout on hover.
 */

export const SectionLabel = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      fontSize: 11,
      letterSpacing: '.24em',
      textTransform: 'uppercase',
      color: 'var(--faint)',
      margin: '18px 0 10px',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Kicker = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>
    {children}
  </div>
);

export const Card = ({
  children,
  style,
  onClick,
  active,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  active?: boolean;
}) => (
  <div
    onClick={onClick}
    style={{
      borderRadius: 16,
      background: active ? 'rgba(157,107,255,.1)' : 'var(--card)',
      boxShadow: active ? 'inset 0 0 0 1px rgba(157,107,255,.3)' : 'inset 0 0 0 1px var(--line2)',
      padding: 16,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip = ({
  children,
  tone,
  onClick,
  active,
  title,
}: {
  children: ReactNode;
  tone?: string;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) => (
  <span
    title={title}
    onClick={onClick}
    style={{
      fontSize: 12,
      padding: '5px 12px',
      borderRadius: 999,
      whiteSpace: 'nowrap',
      cursor: onClick ? 'pointer' : undefined,
      background: active ? 'var(--purple)' : tone ? `${tone}1f` : 'transparent',
      color: active ? '#0a0810' : tone ?? 'var(--muted)',
      boxShadow: active ? 'none' : `inset 0 0 0 1px ${tone ? `${tone}55` : 'var(--line2)'}`,
    }}
  >
    {children}
  </span>
);

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: CSSProperties;
}) => {
  const base: CSSProperties = {
    fontFamily: 'var(--ui)',
    fontSize: 13,
    padding: '9px 18px',
    borderRadius: 999,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    ...style,
  };
  const variants: Record<string, CSSProperties> = {
    primary: {
      background: 'var(--purple)',
      color: '#0a0810',
      fontWeight: 600,
      boxShadow: '0 0 24px rgba(157,107,255,.4)',
    },
    ghost: { background: 'transparent', color: 'var(--muted)', boxShadow: 'inset 0 0 0 1px var(--line2)' },
    danger: { background: 'transparent', color: 'var(--danger)', boxShadow: 'inset 0 0 0 1px var(--danger)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
};

export const SearchField = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: 14, top: 9, color: 'var(--faint)', fontSize: 14 }}>⌕</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        fontFamily: 'var(--ui)',
        fontSize: 13,
        padding: '9px 14px 9px 34px',
        borderRadius: 999,
        background: 'var(--panel)',
        color: 'var(--cream)',
        border: 'none',
        outline: 'none',
        boxShadow: 'inset 0 0 0 1px var(--line2)',
      }}
    />
  </div>
);

export const EmptyState = ({
  glyph,
  title,
  subtitle,
}: {
  glyph: string;
  title: string;
  subtitle?: string;
}) => (
  <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--dim)' }}>
    <div style={{ fontSize: 42, color: 'var(--purpledim)', animation: 'o7glow 4s ease-in-out infinite' }}>{glyph}</div>
    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--cream)', marginTop: 12 }}>{title}</div>
    {subtitle ? (
      <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 15, marginTop: 6 }}>{subtitle}</div>
    ) : null}
  </div>
);

/** Renders text with `[start,end]` highlight ranges as <mark>-styled spans. */
export const Highlight = ({
  text,
  highlights,
}: {
  text: string;
  highlights: Array<[number, number]>;
}) => {
  if (!highlights.length) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  highlights.forEach(([start, end], i) => {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <span
        key={i}
        style={{ background: 'rgba(157,107,255,.22)', color: 'var(--purple2)', borderRadius: 3 }}
      >
        {text.slice(start, end)}
      </span>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
};
