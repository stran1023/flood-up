import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { LiveMap } from './pages/LiveMap';
import { Analytics } from './pages/Analytics';

type Page = 'live' | 'analytics';

function LoginScreen({ onLogin }: { onLogin: (email: string, pass: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await onLogin(email, pass);
    } catch {
      setError('Invalid credentials or insufficient permissions.');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1e293b', padding: 32, borderRadius: 12, width: 320 }}>
        <h2 style={{ margin: '0 0 24px', textAlign: 'center' }}>City Authority Login</h2>
        {error && <div style={{ color: '#f87171', marginBottom: 12, fontSize: 13 }}>{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9' }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: 10, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser]     = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('live');

  useEffect(() => {
    return onAuthStateChanged(auth, async firebaseUser => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setIsAuth(snap.exists() && snap.data()['role'] === 'authority');
      } else {
        setIsAuth(false);
      }

      setLoading(false);
    });
  }, []);

  async function handleLogin(email: string, pass: string) {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!snap.exists() || snap.data()['role'] !== 'authority') {
      await signOut(auth);
      throw new Error('Not an authority account');
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>Loading…</div>;
  }

  if (!user || !isAuth) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const navBtn = (p: Page, label: string) => (
    <button
      onClick={() => setPage(p)}
      style={{
        padding: '8px 16px',
        background: page === p ? '#3b82f6' : 'transparent',
        color: page === p ? '#fff' : '#94a3b8',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ background: '#1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, height: 56, borderBottom: '1px solid #0f172a' }}>
        <span style={{ fontWeight: 700, marginRight: 16 }}>Flood Up</span>
        {navBtn('live', 'Live Map')}
        {navBtn('analytics', 'Analytics')}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#64748b', marginRight: 12 }}>{user.email}</span>
        <button
          onClick={() => signOut(auth)}
          style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          Sign out
        </button>
      </header>

      <main>
        {page === 'live' ? <LiveMap /> : <Analytics />}
      </main>
    </div>
  );
}
