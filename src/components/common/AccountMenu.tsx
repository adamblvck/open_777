import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBackendHealth } from '../../hooks/useBackendHealth';
import { useOpen777 } from '../../state/useOpen777';
import { api } from '../../lib/api';
import AuthModal from './AuthModal';

export default function AccountMenu() {
  const { user, isSignedIn, signOut } = useAuth();
  const health = useBackendHealth();
  const flash = useOpen777((s) => s.flash);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dot = health.checking ? 'var(--faint)' : !health.online ? 'var(--danger)' : !health.db ? '#fcbd3f' : '#34c08a';
  const dotTitle = health.checking ? 'Checking backend…' : !health.online ? 'Backend offline' : !health.db ? 'Backend online · database offline' : 'Backend connected';
  const initial = user?.email?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U';

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account and all cloud data? This cannot be undone.')) return;
    try {
      await api.deleteAccount();
      await signOut();
      flash('Account deleted.');
    } catch {
      flash('Could not delete the account — is the backend online?');
    }
    setMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, position: 'relative' }}>
      <span title={dotTitle} style={{ width: 8, height: 8, borderRadius: '50%', background: dot, boxShadow: `0 0 6px ${dot}` }} />
      <div
        onClick={() => (isSignedIn ? setMenuOpen((v) => !v) : setAuthOpen(true))}
        title={isSignedIn ? user?.email ?? 'Account' : 'Sign in'}
        style={{
          width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isSignedIn ? 'var(--purple)' : 'radial-gradient(circle at 35% 30%, #3a3550, #18151f)',
          color: '#0a0810', fontWeight: 600, fontSize: 14, boxShadow: 'inset 0 0 0 1px var(--line2)',
        }}
      >
        {isSignedIn ? initial : ''}
      </div>

      {authOpen ? <AuthModal onClose={() => setAuthOpen(false)} /> : null}

      {menuOpen && isSignedIn ? (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 80 }} />
          <div style={{ position: 'fixed', left: 80, bottom: 18, zIndex: 81, width: 240, padding: 16, borderRadius: 16, background: 'var(--card2)', boxShadow: '0 18px 50px rgba(0,0,0,.6), inset 0 0 0 1px var(--line2)' }}>
            <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--purpledim)' }}>Signed in</div>
            <div style={{ fontSize: 14, color: 'var(--cream)', margin: '4px 0 14px', wordBreak: 'break-all' }}>{user?.email}</div>
            <div onClick={() => { signOut(); setMenuOpen(false); }} style={{ fontSize: 14, padding: '9px 0', color: 'var(--muted)', cursor: 'pointer' }}>Sign out</div>
            <div onClick={deleteAccount} style={{ fontSize: 14, padding: '9px 0', color: 'var(--danger)', cursor: 'pointer' }}>Delete account</div>
          </div>
        </>
      ) : null}
    </div>
  );
}
