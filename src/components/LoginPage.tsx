import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onOpenPortal?: () => void;
}

export default function LoginPage({ onOpenPortal }: Props) {
  const { signIn, signUp, configError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, name.trim() || undefined);
        setInfo('Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.');
        setMode('signin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center mx-auto shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Nexus Support</h1>
            <p className="text-sm text-slate-500 mt-1">Agent Command Center</p>
          </div>

          {configError && (
            <div className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 px-3 py-3 rounded-xl">
              <p className="font-medium mb-1">Supabase configuration problem</p>
              <p className="text-amber-700/90">{configError}</p>
              <p className="mt-2 text-xs text-amber-600">
                Repo → Settings → Secrets and variables → Actions → set{' '}
                <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
                <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>, then re-run the deploy workflow.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex rounded-lg bg-slate-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setInfo(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{error}</div>
              )}
              {info && (
                <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{info}</div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    placeholder="Sarah Chen"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create agent account'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Customers should use the{' '}
            <button type="button" onClick={onOpenPortal} className="text-sky-600 hover:underline">
              customer portal
            </button>
            {' '}— no login required.
          </p>
        </div>
      </div>
    </div>
  );
}
