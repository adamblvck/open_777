// The ⓘ glossary affordance: a small ringed circle with an italic lowercase "i".
// Inactive = faint inset ring; active (popover open for this row) = violet ring.
export default function InfoDot({ size = 15, active = false, onClick }: { size?: number; active?: boolean; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <span
      onClick={onClick}
      title="Glossary definition"
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `inset 0 0 0 1px ${active ? 'var(--purple)' : 'var(--info-ring)'}`,
        color: active ? 'var(--purple2)' : 'var(--info-text)',
        fontFamily: 'var(--serif2)',
        fontStyle: 'italic',
        fontSize: Math.round(size * 0.72),
        lineHeight: 1,
        cursor: 'pointer',
        flex: 'none',
      }}
    >
      i
    </span>
  );
}
