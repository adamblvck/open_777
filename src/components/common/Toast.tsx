import { useOpen777 } from '../../state/useOpen777';

export default function Toast() {
  const toast = useOpen777((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '13px 26px',
        borderRadius: 999,
        background: 'var(--card2)',
        boxShadow: '0 14px 40px rgba(0,0,0,.5), inset 0 0 0 1px var(--line2)',
        color: 'var(--cream)',
        fontSize: 14,
        animation: 'o7rise .25s ease both',
        zIndex: 60,
      }}
    >
      {toast}
    </div>
  );
}
