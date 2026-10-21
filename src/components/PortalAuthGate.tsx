import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 21a9 9 0 0 1-9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      </svg>
    </div>
  );
}

interface Props {
  onBackToAgent?: () => void;
}

/** Shown when visitor is not a signed-in approved customer. */
export default function PortalAuthGate({ onBackToAgent }: Props) {
  const { signIn, signUp, requiresAuth, configError } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const field =
    'w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 text-zinc-900';
  const btnPrimary =
    'w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50';

  const doAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');
    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        await signIn(authEmail.trim(), authPassword);
      } else {
        await signUp(authEmail.trim(), authPassword, authName.trim() || undefined, 'customer');
        setAuthInfo('Account created. An admin must approve it under Users → Pending before you can sign in.');
        setAuthMode('signin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Auth failed';
      if (/pending admin approval|must approve/i.test(msg)) {
        setAuthInfo(msg);
        setAuthMode('signin');
      } else {
        setAuthError(msg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen portal-atmosphere">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <div className="text-left">
              <div className="font-semibold text-zinc-900 text-sm tracking-tight">Nexus Ops</div>
              <div className="text-[11px] text-zinc-500">Customer portal</div>
            </div>
          </div>
          {onBackToAgent && (
            <button type="button" onClick={onBackToAgent} className="text-xs font-medium text-zinc-400 hover:text-zinc-600">
              Agent login
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Create an account to continue</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Customers must register first. An administrator approves new accounts before you can use the portal.
          </p>
        </div>

        <form onSubmit={doAuth} className="bg-white/90 backdrop-blur rounded-2xl border border-zinc-200 shadow-card p-6 sm:p-8 space-y-4">
          {authError && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{authError}</div>}
          {authInfo && <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{authInfo}</div>}
          {configError && <div className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">{configError}</div>}

          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setAuthError('');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                authMode === 'signup' ? 'bg-brand-100 text-brand-800' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                authMode === 'signin' ? 'bg-brand-100 text-brand-800' : 'text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              Sign in
            </button>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Full name</label>
              <input
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className={field}
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
              className={field}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
              minLength={6}
              className={field}
            />
          </div>
          <button type="submit" disabled={authLoading || !requiresAuth} className={btnPrimary}>
            {authLoading ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
          {!requiresAuth && (
            <p className="text-xs text-zinc-500 text-center">Supabase must be configured for customer accounts.</p>
          )}
          <p className="text-[11px] text-zinc-400 text-center">
            After signup, wait for an admin to approve you under <strong>Users → Pending</strong>.
          </p>
        </form>
      </main>
    </div>
  );
}
