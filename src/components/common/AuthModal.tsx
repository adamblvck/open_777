import { useState } from 'react';
import { authClient } from '../../lib/auth';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!email || !password) {
      setErr('Email and password are required.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const res =
        mode === 'in'
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name || email.split('@')[0] });
      if (res.error) setErr(res.error.message || 'Authentication failed.');
      else onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not reach the server. Is open777-api running?');
    } finally {
      setBusy(false);
    }
  };

  const field: React.CSSProperties = {
    width: '100%', height: 46, borderRadius: 12, background: 'var(--panel)', boxShadow: 'inset 0 0 0 1px var(--line2)',
    padding: '0 16px', color: 'var(--cream)', fontSize: 15, border: 'none', outline: 'none', marginBottom: 10,
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(5,5,7,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '90vw', padding: 30, borderRadius: 20, background: 'var(--card)', boxShadow: '0 24px 60px rgba(0,0,0,.6), inset 0 0 0 1px var(--line2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 30, color: 'var(--purple)', filter: 'drop-shadow(0 0 12px var(--purple))', animation: 'o7glow 5s ease-in-out infinite' }}>✷</div>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 24, color: 'var(--cream)', marginTop: 8 }}>{mode === 'in' ? 'Welcome back' : 'Create your account'}</div>
          <div style={{ fontFamily: 'var(--serif2)', fontStyle: 'italic', fontSize: 13, color: 'var(--dim)', marginTop: 4 }}>Sign in to record scryings to the cloud and keep a library of readings.</div>
        </div>

        {mode === 'up' ? <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" style={field} /> : null}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" autoComplete="email" style={field} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} type="password" placeholder="Password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} style={field} />

        {err ? <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 10 }}>{err}</div> : null}

        <span onClick={busy ? undefined : submit} style={{ display: 'block', textAlign: 'center', fontSize: 15, fontWeight: 600, padding: '13px 0', borderRadius: 999, background: 'var(--purple)', color: '#0a0810', boxShadow: '0 0 24px rgba(157,107,255,.4)', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}
        </span>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
          {mode === 'in' ? 'New here? ' : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr(''); }} style={{ color: 'var(--purple)', cursor: 'pointer' }}>{mode === 'in' ? 'Create an account' : 'Sign in'}</span>
        </div>
      </div>
    </div>
  );
}
